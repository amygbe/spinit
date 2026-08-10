import SwiftUI

@main
struct ChurnApp: App {
    @State private var store = Store()
    /// Palette is a display preference rather than library data, so it lives in
    /// UserDefaults instead of the recipe file.
    @AppStorage("palette") private var paletteID: String = Palette.blueRaspberry.rawValue

    private var palette: Palette {
        Palette(rawValue: paletteID) ?? .blueRaspberry
    }

    var body: some Scene {
        WindowGroup {
            ShelfView()
                .environment(store)
                .environment(\.palette, palette)
                .preferredColorScheme(palette.colorScheme)
                .tint(palette.pop)
        }
    }
}
