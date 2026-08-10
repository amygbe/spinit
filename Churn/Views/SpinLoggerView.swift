import SwiftUI

/// One trip through the machine. Kept short on purpose — this gets filled in
/// while standing at the counter holding a pint.
struct SpinLoggerView: View {
    let recipe: Recipe

    @Environment(Store.self) private var store
    @Environment(\.palette) private var palette
    @Environment(\.dismiss) private var dismiss

    @State private var spin = Spin()
    @State private var isRated = true
    @State private var rating: Double = 9

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    HStack(spacing: 13) {
                        FlavourTile(emoji: recipe.glyph, swatch: recipe.swatch, size: 58)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(recipe.name)
                                .font(Brand.display(24))
                                .foregroundStyle(palette.onGround)
                            Text(spin.date, format: .dateTime.day().month(.wide).year())
                                .font(Brand.body(13, weight: .semibold))
                                .foregroundStyle(palette.onGroundDim)
                        }
                    }

                    picker("Program", Program.allCases, spin.program, \.title) {
                        spin.program = $0
                    }

                    VStack(alignment: .leading, spacing: 9) {
                        BlockHeader(title: "Respins", hint: "how many extra passes")
                        HStack(spacing: 0) {
                            ForEach(0...4, id: \.self) { count in
                                Button {
                                    spin.respins = count
                                } label: {
                                    Text("\(count)")
                                        .font(Brand.display(19))
                                        .foregroundStyle(spin.respins == count ? palette.onPop : palette.ink)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 12)
                                        .background {
                                            if spin.respins == count {
                                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                                    .fill(palette.pop)
                                            }
                                        }
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(4)
                        .sticker(radius: 18)
                    }

                    picker("Texture", Texture.allCases, spin.texture, \.title) {
                        spin.texture = $0
                    }
                    if !spin.texture.advice.isEmpty {
                        Text(spin.texture.advice)
                            .font(Brand.body(14))
                            .foregroundStyle(palette.inkSoft)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(13)
                            .sticker(radius: 16)
                    }

                    VStack(alignment: .leading, spacing: 10) {
                        Toggle(isOn: $isRated) {
                            Text("Rate this batch")
                                .font(Brand.body(15, weight: .bold))
                                .foregroundStyle(palette.onGround)
                        }
                        .tint(palette.pop)
                        if isRated {
                            HStack(spacing: 14) {
                                Text(Ingredient.formatScore(rating))
                                    .font(Brand.display(38))
                                    .foregroundStyle(palette.pop)
                                    .frame(width: 66, alignment: .leading)
                                    .monospacedDigit()
                                Slider(value: $rating, in: 0...10, step: 0.5)
                                    .tint(palette.pop)
                            }
                        }
                    }

                    VStack(alignment: .leading, spacing: 9) {
                        BlockHeader(title: "How was it?")
                        TextEditor(text: $spin.note)
                            .font(Brand.body(15.5))
                            .foregroundStyle(palette.ink)
                            .scrollContentBackground(.hidden)
                            .frame(minHeight: 84)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 8)
                            .sticker(radius: 18)
                    }

                    Button("Save this spin") {
                        spin.rating = isRated ? rating : nil
                        store.logSpin(spin, for: recipe.id)
                        dismiss()
                    }
                    .buttonStyle(PopButtonStyle())
                }
                .padding(.horizontal, 18)
                .padding(.vertical, 18)
            }
            .churnBackground()
            .navigationTitle("Log a spin")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(palette.ground, for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(palette.onGroundDim)
                }
            }
        }
        .onAppear { rating = store.rating(for: recipe.id) ?? 9 }
    }

    /// A wrapping row of chips — reads better than a system Picker against this
    /// palette, and keeps every option visible.
    @ViewBuilder
    private func picker<T: Hashable>(
        _ title: String,
        _ options: [T],
        _ current: T,
        _ label: KeyPath<T, String>,
        _ select: @escaping (T) -> Void
    ) -> some View {
        VStack(alignment: .leading, spacing: 9) {
            BlockHeader(title: title)
            FlowRow(spacing: 8) {
                ForEach(options, id: \.self) { option in
                    Button {
                        select(option)
                    } label: {
                        Text(option[keyPath: label])
                            .font(Brand.body(14, weight: .bold))
                            .foregroundStyle(option == current ? palette.onPop : palette.ink)
                            .padding(.horizontal, 13)
                            .padding(.vertical, 9)
                            .background {
                                if option == current {
                                    Capsule().fill(palette.pop)
                                } else {
                                    Capsule().fill(palette.card)
                                }
                            }
                            .overlay {
                                Capsule().strokeBorder(palette.ink, lineWidth: 2)
                            }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

/// Wrapping horizontal stack. `Layout` arrived in iOS 16, so this is a handful
/// of lines rather than a pile of GeometryReader guesswork.
struct FlowRow: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let maxWidth = proposal.width ?? .infinity
        var x: CGFloat = 0, y: CGFloat = 0, rowHeight: CGFloat = 0
        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x > 0, x + size.width > maxWidth {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
        return CGSize(width: maxWidth == .infinity ? x : maxWidth, height: y + rowHeight)
    }

    func placeSubviews(
        in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()
    ) {
        var x = bounds.minX, y = bounds.minY, rowHeight: CGFloat = 0
        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x > bounds.minX, x + size.width > bounds.maxX {
                x = bounds.minX
                y += rowHeight + spacing
                rowHeight = 0
            }
            view.place(at: CGPoint(x: x, y: y), proposal: ProposedViewSize(size))
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}
