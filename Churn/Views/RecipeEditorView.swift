import SwiftUI

/// Add or edit a flavour. Edits happen on a local draft and only reach the
/// store on Save, so backing out of a half-finished edit changes nothing.
struct RecipeEditorView: View {
    /// nil means a brand new flavour.
    let recipeID: Recipe.ID?

    @Environment(Store.self) private var store
    @Environment(\.palette) private var palette
    @Environment(\.dismiss) private var dismiss

    @State private var draft = Recipe(name: "")
    /// Adjustments are yours, not the recipe's, so they save separately.
    @State private var draftLog = Log(recipeID: UUID())
    @State private var hasLoaded = false
    @State private var newExperiment = ""
    @State private var confirmingDelete = false

    private var isNew: Bool { recipeID == nil }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    identity
                    // No rating here on purpose. Writing a recipe down and
                    // having an opinion of it are separate acts — the score
                    // arrives when you log a spin, after you've eaten it.
                    // Base is deliberately absent: those ingredients belong to
                    // the shared base, not this recipe, so a Base section here
                    // would always be empty and adding to it would be a lie.
                    ForEach(IngredientRole.allCases.filter { $0 != .base }, id: \.self) { role in
                        ingredientSection(role)
                    }
                    baseNote
                    notesSection
                    experimentSection
                    if !isNew { deleteButton }
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 20)
            }
            .churnBackground()
            .navigationTitle(isNew ? "New flavour" : "Edit")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(palette.ground, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(palette.onGroundDim)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save", action: save)
                        .font(Brand.body(16, weight: .bold))
                        .foregroundStyle(palette.pop)
                        .disabled(draft.name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
        .onAppear(perform: load)
        .confirmationDialog("Delete this flavour?", isPresented: $confirmingDelete) {
            Button("Delete", role: .destructive) {
                store.delete(draft)
                dismiss()
            }
        } message: {
            Text("\(draft.name) and its \(draftLog.spins.count) logged spin\(draftLog.spins.count == 1 ? "" : "s") will be gone.")
        }
    }

    // MARK: Sections

    private var identity: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 14) {
                FlavourTile(emoji: draft.glyph, swatch: draft.swatch, size: 72)
                VStack(alignment: .leading, spacing: 7) {
                    Text("Name")
                        .font(Brand.body(13, weight: .bold))
                        .foregroundStyle(palette.onGroundDim)
                    TextField("Mint Chocolate", text: $draft.name)
                        .font(Brand.body(16, weight: .semibold))
                        .foregroundStyle(palette.ink)
                        .padding(.horizontal, 13)
                        .padding(.vertical, 11)
                        .sticker(radius: 16)
                }
            }

            VStack(alignment: .leading, spacing: 7) {
                Text("Emoji")
                    .font(Brand.body(13, weight: .bold))
                    .foregroundStyle(palette.onGroundDim)
                TextField("🍨", text: $draft.glyph)
                    .font(.system(size: 22))
                    .foregroundStyle(palette.ink)
                    .padding(.horizontal, 13)
                    .padding(.vertical, 9)
                    .frame(width: 86)
                    .sticker(radius: 16)
                    .onChange(of: draft.glyph) { _, new in
                        // One glyph is the whole point; trim anything pasted in.
                        if new.count > 2 { draft.glyph = String(new.prefix(2)) }
                    }
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Colour")
                    .font(Brand.body(13, weight: .bold))
                    .foregroundStyle(palette.onGroundDim)
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 10) {
                        ForEach(Swatch.allCases, id: \.self) { swatch in
                            Button {
                                draft.swatch = swatch
                            } label: {
                                Circle()
                                    .fill(swatch.colour)
                                    .frame(width: 34, height: 34)
                                    .overlay {
                                        Circle().strokeBorder(
                                            draft.swatch == swatch ? palette.onGround : .clear,
                                            lineWidth: 3
                                        )
                                    }
                            }
                            .accessibilityLabel(swatch.title)
                        }
                    }
                    .padding(.vertical, 3)
                }
            }
        }
    }

    @ViewBuilder
    private func ingredientSection(_ role: IngredientRole) -> some View {
        let items = draft.ingredients.filter { $0.role == role }
        VStack(alignment: .leading, spacing: 9) {
            BlockHeader(title: role.title, hint: role.verb.lowercased())

            ForEach(items) { item in
                if let index = draft.ingredients.firstIndex(where: { $0.id == item.id }) {
                    IngredientEditorRow(
                        ingredient: $draft.ingredients[index],
                        onDelete: { draft.ingredients.removeAll { $0.id == item.id } }
                    )
                }
            }

            Button {
                draft.ingredients.append(Ingredient("", role: role))
            } label: {
                Label("Add to \(role.title.lowercased())", systemImage: "plus")
                    .font(Brand.body(14, weight: .bold))
                    .foregroundStyle(palette.onGround)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 11)
                    .sticker(radius: 16, style: .outline)
            }
            .buttonStyle(.plain)
        }
    }

    private var baseNote: some View {
        HStack(spacing: 9) {
            Text("🥛").font(.system(size: 16))
            Text("Uses \(store.library.baseName(for: draft)). Edit it in Settings → Your bases.")
                .font(Brand.body(13))
                .foregroundStyle(palette.onGroundDim)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
        }
    }

    private var notesSection: some View {
        VStack(alignment: .leading, spacing: 9) {
            BlockHeader(title: "Notes")
            TextEditor(text: $draft.method)
                .font(Brand.body(15.5))
                .foregroundStyle(palette.ink)
                .scrollContentBackground(.hidden)
                .frame(minHeight: 92)
                .padding(.horizontal, 10)
                .padding(.vertical, 8)
                .sticker(radius: 18)
        }
    }

    private var experimentSection: some View {
        VStack(alignment: .leading, spacing: 9) {
            BlockHeader(title: "Next time", hint: "things to try")

            ForEach(draftLog.adjustments) { experiment in
                HStack(spacing: 10) {
                    Text(experiment.text)
                        .font(Brand.body(15, weight: .semibold))
                        .foregroundStyle(palette.ink)
                    Spacer(minLength: 0)
                    Button {
                        draftLog.adjustments.removeAll { $0.id == experiment.id }
                    } label: {
                        Image(systemName: "xmark")
                            .font(.system(size: 12, weight: .bold))
                            .foregroundStyle(palette.inkMuted)
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
                .sticker(radius: 18)
            }

            HStack(spacing: 10) {
                TextField("Try Nilla Wafers…", text: $newExperiment)
                    .font(Brand.body(15))
                    .foregroundStyle(palette.ink)
                    .onSubmit(addExperiment)
                Button(action: addExperiment) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 21))
                        .foregroundStyle(palette.pop)
                }
                .disabled(newExperiment.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .sticker(radius: 18)
        }
    }

    private var deleteButton: some View {
        Button(role: .destructive) {
            confirmingDelete = true
        } label: {
            Text("Delete flavour")
                .font(Brand.body(15, weight: .bold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 13)
                .sticker(radius: 18, style: .outline)
        }
        .padding(.top, 6)
    }

    // MARK: Actions

    private func load() {
        guard !hasLoaded else { return }
        hasLoaded = true
        if let recipeID, let existing = store.recipe(recipeID) {
            draft = existing
            draftLog = store.log(for: recipeID)
        }
    }

    private func addExperiment() {
        let text = newExperiment.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return }
        draftLog.adjustments.append(Experiment(text: text))
        newExperiment = ""
    }

    private func save() {
        draft.name = draft.name.trimmingCharacters(in: .whitespacesAndNewlines)
        if draft.glyph.isEmpty { draft.glyph = "🍨" }
        // Blank rows are how people back out of an "Add" they didn't want.
        draft.ingredients.removeAll {
            $0.name.trimmingCharacters(in: .whitespaces).isEmpty
        }
        if isNew {
            store.add(draft)
        } else {
            store.update(draft)
        }
        store.replaceAdjustments(draftLog.adjustments, for: draft.id)
        dismiss()
    }
}

// MARK: - Ingredient row

struct IngredientEditorRow: View {
    @Binding var ingredient: Ingredient
    let onDelete: () -> Void
    @Environment(\.palette) private var palette

    /// The stored amount is a Double?; the field needs a plain numeric string.
    /// Deliberately not `Ingredient.format`, which renders ¼ and can't round-trip.
    private var amountText: Binding<String> {
        Binding(
            get: {
                guard let amount = ingredient.amount else { return "" }
                return amount == amount.rounded()
                    ? String(Int(amount))
                    : String(format: "%g", amount)
            },
            set: { new in
                let cleaned = new.replacingOccurrences(of: ",", with: ".")
                ingredient.amount = cleaned.isEmpty ? nil : Double(cleaned)
            }
        )
    }

    var body: some View {
        VStack(spacing: 9) {
            HStack(spacing: 9) {
                TextField("Name", text: $ingredient.name)
                    .font(Brand.body(15, weight: .semibold))
                    .foregroundStyle(palette.ink)
                Button(action: onDelete) {
                    Image(systemName: "xmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundStyle(palette.inkMuted)
                }
                .accessibilityLabel("Remove \(ingredient.name)")
            }

            HStack(spacing: 9) {
                TextField("0", text: amountText)
                    .font(Brand.body(14, weight: .bold))
                    .foregroundStyle(palette.ink)
                    .keyboardType(.decimalPad)
                    .frame(width: 54)
                    .padding(.horizontal, 9)
                    .padding(.vertical, 7)
                    .background(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(palette.hairline)
                    )

                Menu {
                    ForEach(Unit.allCases, id: \.self) { unit in
                        Button(unit.short.isEmpty ? "none" : unit.short) {
                            ingredient.unit = unit
                        }
                    }
                } label: {
                    HStack(spacing: 4) {
                        Text(ingredient.unit.short.isEmpty ? "unit" : ingredient.unit.short)
                            .font(Brand.body(13, weight: .bold))
                        Image(systemName: "chevron.down").font(.system(size: 9, weight: .bold))
                    }
                    .foregroundStyle(palette.inkSoft)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 7)
                    .background(
                        RoundedRectangle(cornerRadius: 10, style: .continuous)
                            .fill(palette.hairline)
                    )
                }

                Spacer(minLength: 0)

                // Labelled, because a bare switch in a row of fields tells you
                // nothing about what it toggles.
                Toggle(isOn: $ingredient.isOptional) {
                    Text("optional")
                        .font(Brand.body(12.5, weight: .bold))
                        .foregroundStyle(palette.inkMuted)
                }
                .toggleStyle(.button)
                .buttonStyle(.plain)
                .background {
                    Capsule().fill(ingredient.isOptional ? palette.popSoft : palette.hairline)
                }
                .overlay {
                    Capsule().strokeBorder(
                        ingredient.isOptional ? palette.pop : .clear, lineWidth: 2
                    )
                }
            }

            TextField("Note (optional)", text: $ingredient.note)
                .font(Brand.body(13))
                .foregroundStyle(palette.inkMuted)
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .sticker(radius: 18)
    }
}
