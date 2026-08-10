import SwiftUI

// MARK: - Sticker

enum StickerStyle {
    /// A raised surface: cream fill, hard offset shadow, solid outline.
    case filled
    /// Not made yet: no fill, no shadow, dashed outline. Reads as a gap on the
    /// shelf rather than an object on it.
    case outline
}

struct Sticker: ViewModifier {
    var radius: CGFloat = 22
    var style: StickerStyle = .filled
    @Environment(\.palette) private var palette

    func body(content: Content) -> some View {
        content
            .background {
                if style == .filled {
                    ZStack {
                        shape.fill(palette.ink).offset(x: 3, y: 4)
                        shape.fill(palette.card)
                    }
                }
            }
            .overlay {
                switch style {
                case .filled:
                    shape.strokeBorder(palette.ink, lineWidth: 2)
                case .outline:
                    shape.strokeBorder(
                        palette.onGroundDim,
                        style: StrokeStyle(lineWidth: 2, dash: [7, 6])
                    )
                }
            }
    }

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: radius, style: .continuous)
    }
}

extension View {
    func sticker(radius: CGFloat = 22, style: StickerStyle = .filled) -> some View {
        modifier(Sticker(radius: radius, style: style))
    }
}

// MARK: - Flavour tile

struct FlavourTile: View {
    let emoji: String
    let swatch: Swatch
    var size: CGFloat = 66
    @Environment(\.palette) private var palette

    var body: some View {
        Text(emoji)
            .font(.system(size: size * 0.5))
            .frame(width: size, height: size)
            .background {
                // Composited over the card colour rather than left translucent:
                // on an outlined card the ground shows through, and tinting
                // against a saturated blue turns every flavour muddy.
                ZStack {
                    shape.fill(palette.card)
                    shape.fill(swatch.colour.opacity(0.26))
                }
            }
            .overlay { shape.strokeBorder(swatch.colour.opacity(0.65), lineWidth: 2) }
    }

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: size * 0.3, style: .continuous)
    }
}

// MARK: - Score badge

struct ScoreBadge: View {
    let rating: Double?
    @Environment(\.palette) private var palette

    var body: some View {
        if let rating {
            Text(Ingredient.formatScore(rating))
                .font(Brand.display(17))
                .foregroundStyle(palette.onPop)
                .padding(.horizontal, 9)
                .padding(.vertical, 1)
                .background(Capsule().fill(palette.pop))
        } else {
            Text("not yet")
                .font(Brand.body(12, weight: .semibold))
                .foregroundStyle(palette.onGround)
        }
    }
}

// MARK: - Squiggle

/// The wavy underline. A real squiggle, not a rule — the hand-drawn wobble is
/// the whole point of the look.
struct Squiggle: Shape {
    var waves: Int = 7

    func path(in rect: CGRect) -> Path {
        var path = Path()
        guard waves > 0, rect.width > 0 else { return path }
        let step = rect.width / CGFloat(waves)
        path.move(to: CGPoint(x: rect.minX, y: rect.midY))
        for i in 0..<waves {
            let startX = rect.minX + CGFloat(i) * step
            let peak = i.isMultiple(of: 2) ? rect.minY : rect.maxY
            path.addQuadCurve(
                to: CGPoint(x: startX + step, y: rect.midY),
                control: CGPoint(x: startX + step / 2, y: peak)
            )
        }
        return path
    }
}

struct SquiggleUnderline: View {
    var width: CGFloat = 120
    @Environment(\.palette) private var palette

    var body: some View {
        Squiggle()
            .stroke(palette.pop, style: StrokeStyle(lineWidth: 3, lineCap: .round))
            .frame(width: width, height: 7)
    }
}

// MARK: - Sprinkles

/// Scattered dots across the ground. Drawn in one Canvas rather than hundreds
/// of views, and seeded so they never reshuffle between redraws.
struct SprinkleField: View {
    var tint: Color
    var spacing: CGFloat = 40

    var body: some View {
        Canvas { context, size in
            var rng = SeededRNG(seed: 20_260_809)
            var y = spacing / 2
            while y < size.height + spacing {
                var x = spacing / 2
                while x < size.width + spacing {
                    let dx = rng.between(-11, 11)
                    let dy = rng.between(-11, 11)
                    let r = rng.between(1.5, 3.1)
                    let box = CGRect(
                        x: x + dx - r, y: y + dy - r,
                        width: r * 2, height: r * 2
                    )
                    context.fill(Path(ellipseIn: box), with: .color(tint))
                    x += spacing
                }
                y += spacing
            }
        }
        .allowsHitTesting(false)
        .ignoresSafeArea()
    }
}

// MARK: - Screen chrome

/// Ground colour plus sprinkles, behind whatever the screen is showing.
struct ChurnBackground: ViewModifier {
    @Environment(\.palette) private var palette

    func body(content: Content) -> some View {
        content
            .background {
                ZStack {
                    palette.ground
                    SprinkleField(tint: palette.onGround.opacity(0.16))
                }
                .ignoresSafeArea()
            }
    }
}

extension View {
    func churnBackground() -> some View { modifier(ChurnBackground()) }
}

// MARK: - Buttons

struct PopButtonStyle: ButtonStyle {
    @Environment(\.palette) private var palette

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Brand.display(20))
            .foregroundStyle(palette.onPop)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 15)
            .background {
                ZStack {
                    shape.fill(palette.ink).offset(x: 3, y: 4)
                    shape.fill(palette.pop)
                }
            }
            .overlay { shape.strokeBorder(palette.ink, lineWidth: 2) }
            .offset(
                x: configuration.isPressed ? 3 : 0,
                y: configuration.isPressed ? 4 : 0
            )
            .animation(.spring(response: 0.32, dampingFraction: 0.62), value: configuration.isPressed)
    }

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: 20, style: .continuous)
    }
}

/// The round + in the shelf header.
struct AddButtonStyle: ButtonStyle {
    @Environment(\.palette) private var palette

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(Brand.body(25, weight: .bold))
            .foregroundStyle(palette.onPop)
            .frame(width: 44, height: 44)
            .background {
                ZStack {
                    shape.fill(palette.ink).offset(x: 2, y: 3)
                    shape.fill(palette.pop)
                }
            }
            .overlay { shape.strokeBorder(palette.ink, lineWidth: 2) }
            .rotationEffect(.degrees(configuration.isPressed ? 90 : 0))
            .animation(.spring(response: 0.32, dampingFraction: 0.62), value: configuration.isPressed)
    }

    private var shape: RoundedRectangle {
        RoundedRectangle(cornerRadius: 15, style: .continuous)
    }
}

// MARK: - Section heading

struct GroupHeading: View {
    let title: String
    var count: Int?
    @Environment(\.palette) private var palette

    var body: some View {
        HStack(spacing: 8) {
            Text(title)
                .font(Brand.body(15, weight: .bold))
                .foregroundStyle(palette.onGroundDim)
            if let count {
                Text("\(count)")
                    .font(Brand.body(12, weight: .heavy))
                    .foregroundStyle(palette.onPop)
                    .padding(.horizontal, 9)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(palette.pop))
            }
            Spacer(minLength: 0)
        }
    }
}
