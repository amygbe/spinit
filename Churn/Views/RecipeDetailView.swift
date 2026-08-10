import SwiftUI

struct RecipeDetailView: View {
    let recipeID: Recipe.ID

    @Environment(Store.self) private var store
    @Environment(\.palette) private var palette
    @Environment(\.dismiss) private var dismiss

    @State private var isEditing = false
    @State private var isLogging = false

    private var recipe: Recipe? { store.recipe(recipeID) }
    private var log: Log { store.log(for: recipeID) }

    var body: some View {
        ScrollView {
            if let recipe {
                VStack(alignment: .leading, spacing: 22) {
                    hero(recipe)
                    ingredientBlock("Base", "blend, then freeze 24h",
                                    store.library.base(for: recipe), recipe.swatch)
                    ForEach(IngredientRole.allCases.filter { $0 != .base }, id: \.self) { role in
                        ingredientBlock(role.title, role.verb.lowercased(),
                                        recipe.ingredients(role), recipe.swatch)
                    }
                    experiments(recipe)
                    notes(recipe)
                    spins(recipe)
                    Button("Log a spin") { isLogging = true }
                        .buttonStyle(PopButtonStyle())
                        .padding(.top, 4)
                }
                .padding(.horizontal, 18)
                .padding(.bottom, 44)
            } else {
                Text("This flavour is gone.")
                    .font(Brand.display(20))
                    .foregroundStyle(palette.onGround)
                    .padding(.top, 60)
            }
        }
        .churnBackground()
        .toolbarBackground(palette.ground, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Edit") { isEditing = true }
                    .font(Brand.body(16, weight: .bold))
                    .foregroundStyle(palette.pop)
            }
        }
        .sheet(isPresented: $isEditing) {
            RecipeEditorView(recipeID: recipeID)
        }
        .sheet(isPresented: $isLogging) {
            if let recipe { SpinLoggerView(recipe: recipe) }
        }
    }

    // MARK: Hero

    private func hero(_ recipe: Recipe) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            FlavourTile(emoji: recipe.glyph, swatch: recipe.swatch, size: 92)

            VStack(alignment: .leading, spacing: 6) {
                Text(recipe.name)
                    .font(Brand.display(36))
                    .foregroundStyle(palette.onGround)
                    .fixedSize(horizontal: false, vertical: true)
                SquiggleUnderline(width: 108)
                Text(store.library.baseName(for: recipe))
                    .font(Brand.body(14, weight: .semibold))
                    .foregroundStyle(palette.onGroundDim)
                    .padding(.top, 2)
            }

            HStack(alignment: .lastTextBaseline, spacing: 16) {
                if let rating = log.rating {
                    HStack(alignment: .lastTextBaseline, spacing: 3) {
                        Text(Ingredient.formatScore(rating))
                            .font(Brand.display(54))
                            .foregroundStyle(palette.pop)
                        Text("/10")
                            .font(Brand.body(15, weight: .bold))
                            .foregroundStyle(palette.onGroundDim)
                    }
                } else {
                    Text("Not made yet")
                        .font(Brand.display(22))
                        .foregroundStyle(palette.onGroundDim)
                }
                Spacer(minLength: 0)
                VStack(alignment: .trailing, spacing: 2) {
                    Text("Program")
                        .font(Brand.body(12.5, weight: .semibold))
                        .foregroundStyle(palette.onGroundDim)
                    Text(log.spins.first?.program.title ?? Program.liteIceCream.title)
                        .font(Brand.body(16, weight: .bold))
                        .foregroundStyle(palette.onGround)
                }
            }
            .padding(.top, 4)
        }
        .padding(.top, 4)
    }

    // MARK: Blocks

    @ViewBuilder
    private func ingredientBlock(
        _ title: String, _ hint: String, _ items: [Ingredient], _ swatch: Swatch
    ) -> some View {
        if !items.isEmpty {
            VStack(alignment: .leading, spacing: 9) {
                BlockHeader(title: title, hint: hint)
                VStack(spacing: 0) {
                    ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                        if index > 0 {
                            Rectangle()
                                .fill(palette.hairline)
                                .frame(height: 2)
                        }
                        IngredientRow(ingredient: item, swatch: swatch)
                    }
                }
                .sticker(radius: 22)
            }
        }
    }

    @ViewBuilder
    private func experiments(_ recipe: Recipe) -> some View {
        if !log.adjustments.isEmpty {
            VStack(alignment: .leading, spacing: 9) {
                BlockHeader(
                    title: "Next time",
                    hint: "\(log.openAdjustments.count) to try"
                )
                VStack(spacing: 8) {
                    ForEach(log.adjustments) { experiment in
                        Button {
                            store.setAdjustment(experiment, done: !experiment.isDone, for: recipeID)
                        } label: {
                            ExperimentRow(experiment: experiment)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func notes(_ recipe: Recipe) -> some View {
        if !recipe.method.isEmpty || !log.notes.isEmpty {
            VStack(alignment: .leading, spacing: 9) {
                BlockHeader(title: "Notes", hint: recipe.origin == .mine ? "" : "from \(recipe.author)")
                Text(recipe.method.isEmpty ? log.notes : recipe.method)
                    .font(Brand.body(15.5))
                    .foregroundStyle(palette.inkSoft)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(14)
                    .sticker(radius: 20)
            }
        }
    }

    @ViewBuilder
    private func spins(_ recipe: Recipe) -> some View {
        if !log.spins.isEmpty {
            VStack(alignment: .leading, spacing: 9) {
                BlockHeader(title: "Spins", hint: "\(log.spins.count) logged")
                VStack(spacing: 8) {
                    ForEach(log.spins) { spin in
                        HStack(spacing: 12) {
                            Text(spin.date, format: .dateTime.day(.twoDigits).month(.twoDigits).year(.twoDigits))
                                .font(Brand.body(13, weight: .bold))
                                .foregroundStyle(palette.ink)
                                .monospacedDigit()
                            Text("\(spin.program.title) · \(spin.respins) respin\(spin.respins == 1 ? "" : "s")")
                                .font(Brand.body(13))
                                .foregroundStyle(palette.inkMuted)
                                .lineLimit(1)
                                .minimumScaleFactor(0.8)
                            Spacer(minLength: 0)
                            if let rating = spin.rating {
                                Text(Ingredient.formatScore(rating))
                                    .font(Brand.display(19))
                                    .foregroundStyle(palette.ink)
                            }
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 11)
                        .sticker(radius: 18)
                    }
                }
            }
        }
    }
}

// MARK: - Shared rows

struct BlockHeader: View {
    let title: String
    var hint: String = ""
    @Environment(\.palette) private var palette

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title)
                .font(Brand.display(21))
                .foregroundStyle(palette.onGround)
            Spacer(minLength: 8)
            if !hint.isEmpty {
                Text(hint)
                    .font(Brand.body(12.5, weight: .semibold))
                    .foregroundStyle(palette.onGroundDim)
            }
        }
    }
}

struct IngredientRow: View {
    let ingredient: Ingredient
    let swatch: Swatch
    @Environment(\.palette) private var palette

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 13) {
            Text(ingredient.measurement)
                .font(Brand.body(13, weight: .heavy))
                .foregroundStyle(ingredient.amount == nil ? palette.inkMuted : swatch.colour)
                .monospacedDigit()
                .frame(width: 58, alignment: .trailing)

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 7) {
                    Text(ingredient.name)
                        .font(Brand.body(15.5, weight: .semibold))
                        .foregroundStyle(palette.ink)
                    if ingredient.isOptional {
                        Text("optional")
                            .font(Brand.body(11, weight: .bold))
                            .foregroundStyle(palette.inkMuted)
                            .padding(.horizontal, 7)
                            .padding(.vertical, 2)
                            .background(Capsule().fill(palette.hairline))
                    }
                }
                if !ingredient.note.isEmpty {
                    Text(ingredient.note)
                        .font(Brand.body(13))
                        .foregroundStyle(palette.inkMuted)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 15)
        .padding(.vertical, 12)
    }
}

struct ExperimentRow: View {
    let experiment: Experiment
    @Environment(\.palette) private var palette

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 7, style: .continuous)
                    .strokeBorder(
                        experiment.isDone ? palette.onGroundDim : palette.pop,
                        lineWidth: 2.5
                    )
                    .background(
                        RoundedRectangle(cornerRadius: 7, style: .continuous)
                            .fill(experiment.isDone ? palette.onGroundDim : .clear)
                    )
                    .frame(width: 21, height: 21)
                if experiment.isDone {
                    Image(systemName: "checkmark")
                        .font(.system(size: 11, weight: .black))
                        .foregroundStyle(palette.ground)
                }
            }
            .padding(.top, 1)

            VStack(alignment: .leading, spacing: 4) {
                Text(experiment.text)
                    .font(Brand.body(15.5, weight: .semibold))
                    .foregroundStyle(experiment.isDone ? palette.onGroundDim : palette.ink)
                    .strikethrough(experiment.isDone, color: palette.onGroundDim)
                    .multilineTextAlignment(.leading)
                if !experiment.verdict.isEmpty {
                    Text(experiment.verdict)
                        .font(Brand.body(13))
                        .foregroundStyle(palette.onGroundDim)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 15)
        .padding(.vertical, 13)
        .sticker(radius: 19, style: experiment.isDone ? .outline : .filled)
    }
}
