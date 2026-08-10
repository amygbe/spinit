import SwiftUI

struct ShelfView: View {
    @Environment(Store.self) private var store
    @Environment(\.palette) private var palette

    @State private var isAdding = false
    @State private var showingSettings = false

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
    ]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    header
                    if store.openAdjustmentCount > 0 { nextUpCard }
                    group("Tried & true", store.made)
                    group("On the list", store.onTheList)
                    if store.library.recipes.isEmpty { emptyShelf }
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 44)
            }
            .churnBackground()
            .toolbar(.hidden, for: .navigationBar)
            .navigationDestination(for: Recipe.ID.self) { id in
                RecipeDetailView(recipeID: id)
            }
            .sheet(isPresented: $isAdding) {
                RecipeEditorView(recipeID: nil)
            }
            .sheet(isPresented: $showingSettings) {
                SettingsView()
            }
        }
    }

    // MARK: Pieces

    private var header: some View {
        HStack(spacing: 8) {
            VStack(alignment: .leading, spacing: 5) {
                Text("The shelf")
                    .font(Brand.display(34))
                    .foregroundStyle(palette.onGround)
                SquiggleUnderline(width: 116)
            }
            Spacer(minLength: 0)
            NavigationLink {
                CatalogueView()
            } label: {
                Image(systemName: "books.vertical.fill")
                    .font(.system(size: 18, weight: .bold))
                    .foregroundStyle(palette.onGround)
                    .frame(width: 40, height: 44)
            }
            .accessibilityLabel("Catalogue")

            Button {
                showingSettings = true
            } label: {
                Image(systemName: "gearshape.fill")
                    .font(.system(size: 19, weight: .bold))
                    .foregroundStyle(palette.onGround)
                    .frame(width: 40, height: 44)
            }
            .accessibilityLabel("Settings")

            Button { isAdding = true } label: { Text("+") }
                .buttonStyle(AddButtonStyle())
                .accessibilityLabel("Add a flavour")
        }
        .padding(.top, 6)
    }

    /// The experiment count is the most actionable thing in the app — it's the
    /// list of what to try next — so it gets a card rather than a tab.
    private var nextUpCard: some View {
        NavigationLink {
            NextUpView()
        } label: {
            HStack(spacing: 12) {
                Text("🧪").font(.system(size: 22))
                VStack(alignment: .leading, spacing: 1) {
                    Text("Next time")
                        .font(Brand.display(18))
                        .foregroundStyle(palette.ink)
                    Text("things to try across the shelf")
                        .font(Brand.body(12.5))
                        .foregroundStyle(palette.inkMuted)
                }
                Spacer(minLength: 0)
                Text("\(store.openAdjustmentCount)")
                    .font(Brand.display(17))
                    .foregroundStyle(palette.onPop)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(palette.pop))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .sticker(radius: 20)
        }
        .buttonStyle(.plain)
        .padding(.top, 6)
    }

    @ViewBuilder
    private func group(_ title: String, _ recipes: [Recipe]) -> some View {
        if !recipes.isEmpty {
            GroupHeading(title: title, count: recipes.count)
                .padding(.top, 12)
            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(recipes) { recipe in
                    NavigationLink(value: recipe.id) {
                        FlavourCard(recipe: recipe,
                                     rating: store.rating(for: recipe.id),
                                     hasBeenMade: store.hasBeenMade(recipe.id))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var emptyShelf: some View {
        VStack(spacing: 10) {
            Text("🍨").font(.system(size: 44))
            Text("Nothing on the shelf yet")
                .font(Brand.display(20))
                .foregroundStyle(palette.onGround)
            Text("Tap + to write down your first flavour.")
                .font(Brand.body(14))
                .foregroundStyle(palette.onGroundDim)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }
}

// MARK: - Card

/// The sticker-sheet cell: big emoji, name under it, score badge in the corner.
struct FlavourCard: View {
    let recipe: Recipe
    /// Passed in rather than looked up, so the card stays a pure view of one row.
    let rating: Double?
    let hasBeenMade: Bool
    @Environment(\.palette) private var palette

    var body: some View {
        VStack(spacing: 10) {
            FlavourTile(emoji: recipe.glyph, swatch: recipe.swatch, size: 64)
            Text(recipe.name)
                .font(Brand.display(17))
                .foregroundStyle(hasBeenMade ? palette.ink : palette.onGround)
                .multilineTextAlignment(.center)
                .lineLimit(2)
                .minimumScaleFactor(0.8)
                .fixedSize(horizontal: false, vertical: true)
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 10)
        .padding(.vertical, 18)
        .frame(minHeight: 156)
        .overlay(alignment: .topTrailing) {
            ScoreBadge(rating: rating)
                .padding(9)
        }
        .sticker(radius: 24, style: hasBeenMade ? .filled : .outline)
        .contentShape(Rectangle())
    }
}

#Preview {
    ShelfView()
        .environment(Store(preview: .seed))
        .environment(\.palette, .blueRaspberry)
}
