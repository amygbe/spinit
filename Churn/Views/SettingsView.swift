import SwiftUI

struct SettingsView: View {
    @Environment(Store.self) private var store
    @Environment(\.palette) private var palette
    @Environment(\.dismiss) private var dismiss
    @AppStorage("palette") private var paletteID: String = Palette.blueRaspberry.rawValue

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    VStack(alignment: .leading, spacing: 10) {
                        BlockHeader(title: "Colours", hint: "blue raspberry & friends")
                        ForEach(Palette.allCases) { option in
                            Button {
                                paletteID = option.rawValue
                            } label: {
                                PaletteRow(option: option, isSelected: option == palette)
                            }
                            .buttonStyle(.plain)
                        }
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        BlockHeader(title: "Your bases")
                        NavigationLink {
                            BasesView()
                        } label: {
                            HStack(spacing: 12) {
                                Text("🥛").font(.system(size: 20))
                                VStack(alignment: .leading, spacing: 1) {
                                    Text(store.library.defaultBase?.name ?? "No base yet")
                                        .font(Brand.display(17))
                                        .foregroundStyle(palette.ink)
                                    Text(store.library.defaultBase?.summary ?? "")
                                        .font(Brand.body(12.5))
                                        .foregroundStyle(palette.inkMuted)
                                        .lineLimit(1)
                                }
                                Spacer(minLength: 0)
                                Image(systemName: "chevron.right")
                                    .font(.system(size: 13, weight: .bold))
                                    .foregroundStyle(palette.inkMuted)
                            }
                            .padding(.horizontal, 14)
                            .padding(.vertical, 13)
                            .sticker(radius: 20)
                        }
                        .buttonStyle(.plain)
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        BlockHeader(title: "About")
                        VStack(alignment: .leading, spacing: 9) {
                            aboutRow("Flavours", "\(store.library.recipes.count)")
                            aboutRow("Spins logged",
                                     "\(store.library.logs.reduce(0) { $0 + $1.spins.count })")
                            aboutRow("Things to try", "\(store.openAdjustmentCount)")
                            // Surfaced because a font that fails to register
                            // substitutes silently — this makes that visible.
                            aboutRow("Display font",
                                     Brand.isDisplayFontAvailable ? "Sour Gummy" : "System (fallback)")
                        }
                        .padding(.horizontal, 14)
                        .padding(.vertical, 13)
                        .sticker(radius: 20)
                    }

                    if let error = store.saveError {
                        Text("Couldn't save: \(error)")
                            .font(Brand.body(13, weight: .semibold))
                            .foregroundStyle(palette.ink)
                            .padding(13)
                            .sticker(radius: 16)
                    }
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 18)
            }
            .churnBackground()
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(palette.ground, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(Brand.body(16, weight: .bold))
                        .foregroundStyle(palette.pop)
                }
            }
        }
    }

    private func aboutRow(_ key: String, _ value: String) -> some View {
        HStack {
            Text(key)
                .font(Brand.body(14.5))
                .foregroundStyle(palette.inkSoft)
            Spacer(minLength: 8)
            Text(value)
                .font(Brand.body(14.5, weight: .bold))
                .foregroundStyle(palette.ink)
        }
    }
}

/// A palette shown in its own colours, so the choice is the preview.
struct PaletteRow: View {
    let option: Palette
    let isSelected: Bool
    @Environment(\.palette) private var palette

    var body: some View {
        HStack(spacing: 13) {
            ZStack {
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(option.ground)
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(palette.ink, lineWidth: 2)
                Circle()
                    .fill(option.pop)
                    .frame(width: 18, height: 18)
                    .offset(x: 11, y: 11)
            }
            .frame(width: 52, height: 52)

            VStack(alignment: .leading, spacing: 2) {
                Text(option.title)
                    .font(Brand.display(17))
                    .foregroundStyle(palette.ink)
                Text(option.blurb)
                    .font(Brand.body(12.5))
                    .foregroundStyle(palette.inkMuted)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 0)

            if isSelected {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 21))
                    .foregroundStyle(palette.pop)
            }
        }
        .padding(.horizontal, 13)
        .padding(.vertical, 12)
        .sticker(radius: 20)
        .overlay {
            if isSelected {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .strokeBorder(palette.pop, lineWidth: 3)
            }
        }
    }
}

// MARK: - Bases

struct BasesView: View {
    @Environment(Store.self) private var store
    @Environment(\.palette) private var palette

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                ForEach(store.library.bases) { base in
                    VStack(alignment: .leading, spacing: 9) {
                        BlockHeader(title: base.name, hint: base.isDefault ? "default" : "")
                        if !base.note.isEmpty {
                            Text(base.note)
                                .font(Brand.body(14))
                                .foregroundStyle(palette.onGroundDim)
                        }
                        VStack(spacing: 0) {
                            ForEach(Array(base.ingredients.enumerated()), id: \.element.id) { index, item in
                                if index > 0 {
                                    Rectangle().fill(palette.hairline).frame(height: 2)
                                }
                                IngredientRow(ingredient: item, swatch: .vanilla)
                            }
                        }
                        .sticker(radius: 22)
                    }
                }

                Text("Every flavour starts from a base unless it overrides one. Editing a base changes every flavour that uses it.")
                    .font(Brand.body(13))
                    .foregroundStyle(palette.onGroundDim)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 18)
        }
        .churnBackground()
        .navigationTitle("Bases")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(palette.ground, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
    }
}

// MARK: - Next up

struct NextUpView: View {
    @Environment(Store.self) private var store
    @Environment(\.palette) private var palette

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                if store.openAdjustments.isEmpty {
                    VStack(spacing: 10) {
                        Text("✨").font(.system(size: 40))
                        Text("Nothing left to try")
                            .font(Brand.display(20))
                            .foregroundStyle(palette.onGround)
                        Text("Add ideas from any flavour's edit screen.")
                            .font(Brand.body(14))
                            .foregroundStyle(palette.onGroundDim)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 60)
                } else {
                    ForEach(store.made + store.onTheList) { recipe in
                        let open = store.log(for: recipe.id).openAdjustments
                        if !open.isEmpty {
                            VStack(alignment: .leading, spacing: 9) {
                                HStack(spacing: 10) {
                                    FlavourTile(emoji: recipe.glyph, swatch: recipe.swatch, size: 34)
                                    Text(recipe.name)
                                        .font(Brand.display(19))
                                        .foregroundStyle(palette.onGround)
                                }
                                ForEach(open) { experiment in
                                    Button {
                                        store.setAdjustment(experiment, done: true, for: recipe.id)
                                    } label: {
                                        ExperimentRow(experiment: experiment)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 18)
        }
        .churnBackground()
        .navigationTitle("Next time")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(palette.ground, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
    }
}
