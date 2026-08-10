import SwiftUI

/// The shared catalogue: Amy's approved recipes plus community ones, fetched
/// live. Saving copies a recipe onto your shelf; your ratings never leave.
struct CatalogueView: View {
    @Environment(Store.self) private var store
    @Environment(\.palette) private var palette

    enum Phase {
        case loading
        case loaded([CatalogueClient.WireRecipe])
        case failed(String)
    }

    @State private var phase: Phase = .loading
    @State private var selected: CatalogueClient.WireRecipe?
    @State private var isSharing = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                switch phase {
                case .loading:
                    loadingView
                case .failed(let message):
                    failedView(message)
                case .loaded(let recipes):
                    loadedView(recipes)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .padding(.bottom, 40)
        }
        .churnBackground()
        .navigationTitle("Catalogue")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(palette.ground, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Share yours") { isSharing = true }
                    .font(Brand.body(15, weight: .bold))
                    .foregroundStyle(palette.pop)
            }
        }
        .refreshable { await load() }
        .task { await load() }
        .sheet(item: $selected) { recipe in
            CatalogueDetailSheet(wire: recipe)
        }
        .sheet(isPresented: $isSharing) {
            SubmitRecipeView()
        }
    }

    private func load() async {
        if case .loaded = phase {} else { phase = .loading }
        do {
            phase = .loaded(try await CatalogueClient.fetchCatalogue())
        } catch {
            phase = .failed(error.localizedDescription)
        }
    }

    // MARK: States

    private var loadingView: some View {
        VStack(spacing: 12) {
            ProgressView().tint(palette.onGround)
            Text("Fetching the catalogue…")
                .font(Brand.body(14, weight: .semibold))
                .foregroundStyle(palette.onGroundDim)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 80)
    }

    private func failedView(_ message: String) -> some View {
        VStack(spacing: 12) {
            Text("🌨️").font(.system(size: 40))
            Text(message)
                .font(Brand.body(15, weight: .semibold))
                .foregroundStyle(palette.onGround)
                .multilineTextAlignment(.center)
            Button("Try again") { Task { await load() } }
                .buttonStyle(PopButtonStyle())
                .frame(width: 180)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }

    @ViewBuilder
    private func loadedView(_ recipes: [CatalogueClient.WireRecipe]) -> some View {
        let curated = recipes.filter { $0.author == "Amy" }
        let community = recipes.filter { $0.author != "Amy" }

        if recipes.isEmpty {
            VStack(spacing: 10) {
                Text("🍨").font(.system(size: 40))
                Text("Nothing here yet")
                    .font(Brand.display(20))
                    .foregroundStyle(palette.onGround)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 70)
        }

        section("Amy's approved", curated)
        section("From the community", community)
    }

    @ViewBuilder
    private func section(_ title: String, _ recipes: [CatalogueClient.WireRecipe]) -> some View {
        if !recipes.isEmpty {
            GroupHeading(title: title, count: recipes.count)
                .padding(.top, 8)
            ForEach(recipes) { wire in
                Button {
                    selected = wire
                } label: {
                    CatalogueRow(wire: wire, onShelf: store.hasOnShelf(wire))
                }
                .buttonStyle(.plain)
            }
        }
    }
}

// MARK: - Row

private struct CatalogueRow: View {
    let wire: CatalogueClient.WireRecipe
    let onShelf: Bool
    @Environment(\.palette) private var palette

    var body: some View {
        HStack(spacing: 13) {
            FlavourTile(
                emoji: wire.glyph,
                swatch: Swatch(rawValue: wire.swatch) ?? .vanilla,
                size: 52
            )
            VStack(alignment: .leading, spacing: 2) {
                Text(wire.name)
                    .font(Brand.display(18))
                    .foregroundStyle(palette.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)
                Text("by \(wire.author) · \(wire.ingredients.count) ingredient\(wire.ingredients.count == 1 ? "" : "s")")
                    .font(Brand.body(12.5))
                    .foregroundStyle(palette.inkMuted)
            }
            Spacer(minLength: 0)
            if onShelf {
                Text("on your shelf")
                    .font(Brand.body(11.5, weight: .bold))
                    .foregroundStyle(palette.inkMuted)
            } else {
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(palette.inkMuted)
            }
        }
        .padding(.horizontal, 13)
        .padding(.vertical, 11)
        .sticker(radius: 20)
        .contentShape(Rectangle())
    }
}

// MARK: - Detail sheet

private struct CatalogueDetailSheet: View {
    let wire: CatalogueClient.WireRecipe

    @Environment(Store.self) private var store
    @Environment(\.palette) private var palette
    @Environment(\.dismiss) private var dismiss

    @State private var justSaved = false

    private var recipe: Recipe { wire.asRecipe() }
    private var alreadyOnShelf: Bool { store.hasOnShelf(wire) }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    HStack(spacing: 14) {
                        FlavourTile(emoji: recipe.glyph, swatch: recipe.swatch, size: 74)
                        VStack(alignment: .leading, spacing: 3) {
                            Text(recipe.name)
                                .font(Brand.display(28))
                                .foregroundStyle(palette.onGround)
                            Text("by \(recipe.author)")
                                .font(Brand.body(14, weight: .semibold))
                                .foregroundStyle(palette.onGroundDim)
                        }
                    }

                    if !recipe.method.isEmpty {
                        Text(recipe.method)
                            .font(Brand.body(15))
                            .foregroundStyle(palette.inkSoft)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(13)
                            .sticker(radius: 18)
                    }

                    if let base = recipe.customBase {
                        ingredientList("Base", base, recipe.swatch)
                    } else {
                        Text("🥛 Uses your default base")
                            .font(Brand.body(13, weight: .semibold))
                            .foregroundStyle(palette.onGroundDim)
                    }

                    ForEach(IngredientRole.allCases.filter { $0 != .base }, id: \.self) { role in
                        ingredientList(role.title, recipe.ingredients(role), recipe.swatch)
                    }

                    Button(alreadyOnShelf || justSaved ? "On your shelf ✓" : "Add to my shelf") {
                        guard !alreadyOnShelf else { return }
                        store.add(recipe)
                        justSaved = true
                        // A beat to show the checkmark, then away.
                        Task {
                            try? await Task.sleep(for: .seconds(0.6))
                            dismiss()
                        }
                    }
                    .buttonStyle(PopButtonStyle())
                    .disabled(alreadyOnShelf || justSaved)
                    .opacity(alreadyOnShelf ? 0.55 : 1)
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 16)
            }
            .churnBackground()
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .foregroundStyle(palette.pop)
                }
            }
        }
    }

    @ViewBuilder
    private func ingredientList(_ title: String, _ items: [Ingredient], _ swatch: Swatch) -> some View {
        if !items.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                BlockHeader(title: title)
                VStack(spacing: 0) {
                    ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                        if index > 0 {
                            Rectangle().fill(palette.hairline).frame(height: 2)
                        }
                        IngredientRow(ingredient: item, swatch: swatch)
                    }
                }
                .sticker(radius: 20)
            }
        }
    }
}

// MARK: - Submit

/// Send one of your own recipes to the review queue.
private struct SubmitRecipeView: View {
    @Environment(Store.self) private var store
    @Environment(\.palette) private var palette
    @Environment(\.dismiss) private var dismiss

    /// Remembered between submissions — nobody wants to retype their name.
    @AppStorage("submitName") private var author = ""

    @State private var selectedID: Recipe.ID?
    @State private var isSending = false
    @State private var outcome: String?
    @State private var errorMessage: String?

    /// Only recipes you wrote are offered — resubmitting the catalogue's own
    /// recipes back to it helps nobody.
    private var mine: [Recipe] {
        store.library.recipes.filter { $0.origin == .mine }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    if let outcome {
                        VStack(spacing: 10) {
                            Text("💌").font(.system(size: 40))
                            Text(outcome)
                                .font(Brand.body(15, weight: .semibold))
                                .foregroundStyle(palette.onGround)
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 50)
                    } else if mine.isEmpty {
                        VStack(spacing: 10) {
                            Text("✏️").font(.system(size: 36))
                            Text("Nothing of yours to share yet")
                                .font(Brand.display(19))
                                .foregroundStyle(palette.onGround)
                            Text("Recipes you write with + can be shared here. Ones saved from the catalogue can't be resubmitted.")
                                .font(Brand.body(13.5))
                                .foregroundStyle(palette.onGroundDim)
                                .multilineTextAlignment(.center)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                    } else {
                        VStack(alignment: .leading, spacing: 7) {
                            Text("Your display name")
                                .font(Brand.body(13, weight: .bold))
                                .foregroundStyle(palette.onGroundDim)
                            TextField("What should the credit say?", text: $author)
                                .font(Brand.body(16, weight: .semibold))
                                .foregroundStyle(palette.ink)
                                .padding(.horizontal, 13)
                                .padding(.vertical, 11)
                                .sticker(radius: 16)
                        }

                        VStack(alignment: .leading, spacing: 8) {
                            Text("Which recipe?")
                                .font(Brand.body(13, weight: .bold))
                                .foregroundStyle(palette.onGroundDim)
                            ForEach(mine) { recipe in
                                Button {
                                    selectedID = recipe.id
                                } label: {
                                    HStack(spacing: 12) {
                                        FlavourTile(emoji: recipe.glyph, swatch: recipe.swatch, size: 44)
                                        Text(recipe.name)
                                            .font(Brand.display(17))
                                            .foregroundStyle(palette.ink)
                                        Spacer(minLength: 0)
                                        if selectedID == recipe.id {
                                            Image(systemName: "checkmark.circle.fill")
                                                .font(.system(size: 20))
                                                .foregroundStyle(palette.pop)
                                        }
                                    }
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 10)
                                    .sticker(radius: 18)
                                    .overlay {
                                        if selectedID == recipe.id {
                                            RoundedRectangle(cornerRadius: 18, style: .continuous)
                                                .strokeBorder(palette.pop, lineWidth: 3)
                                        }
                                    }
                                }
                                .buttonStyle(.plain)
                            }
                        }

                        Text("Amy reads every submission before it appears — your rating and notes stay on your phone.")
                            .font(Brand.body(13))
                            .foregroundStyle(palette.onGroundDim)
                            .fixedSize(horizontal: false, vertical: true)

                        Button(isSending ? "Sending…" : "Send for review") {
                            Task { await send() }
                        }
                        .buttonStyle(PopButtonStyle())
                        .disabled(!canSend || isSending)
                        .opacity(canSend ? 1 : 0.55)
                    }
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 16)
            }
            .churnBackground()
            .navigationTitle("Share a recipe")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(palette.ground, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button(outcome == nil ? "Cancel" : "Done") { dismiss() }
                        .foregroundStyle(palette.onGroundDim)
                }
            }
            .alert(
                "Couldn't send",
                isPresented: Binding(
                    get: { errorMessage != nil },
                    set: { if !$0 { errorMessage = nil } }
                )
            ) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }

    private var canSend: Bool {
        selectedID != nil && !author.trimmingCharacters(in: .whitespaces).isEmpty
    }

    private func send() async {
        guard let selectedID, let recipe = store.recipe(selectedID) else { return }
        isSending = true
        defer { isSending = false }
        do {
            try await CatalogueClient.submit(
                recipe,
                author: author.trimmingCharacters(in: .whitespaces)
            )
            outcome = "Sent! It'll appear in the catalogue once Amy approves it."
        } catch {
            // Surface the server's own words — they're written for humans
            // ("That's a lot of recipes at once. Try again in an hour.").
            errorMessage = error.localizedDescription
        }
    }
}


private extension Store {
    /// Matched by id, and by name as a fallback — the catalogue copies of the
    /// starter recipes have different ids than the ones seeded on-device, and
    /// "Add to my shelf" duplicating your own Banana would be silly.
    func hasOnShelf(_ wire: CatalogueClient.WireRecipe) -> Bool {
        let id = wire.asRecipe().id
        let name = wire.name.lowercased()
        return library.recipes.contains { $0.id == id || $0.name.lowercased() == name }
    }
}
