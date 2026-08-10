import Foundation
import Observation

/// Everything the app owns, in one Codable document.
///
/// A recipe log is a few dozen small records that one person edits by hand, so
/// a single JSON file beats a database here: no schema migrations to babysit,
/// the whole library exports and restores by copying one file, and the seed
/// data is just a literal.
///
/// `recipes` and `logs` are kept side by side rather than nested, because a
/// recipe can arrive from the shared catalogue while the log for it is always
/// local. Merging a catalogue update must never touch anyone's ratings.
struct Library: Codable {
    var bases: [Base] = []
    var recipes: [Recipe] = []
    var logs: [Log] = []
    /// Bumped when the shape changes so a future version knows what it's reading.
    var schemaVersion: Int = 2

    var defaultBase: Base? {
        bases.first(where: \.isDefault) ?? bases.first
    }

    func base(for recipe: Recipe) -> [Ingredient] {
        if let custom = recipe.customBase { return custom }
        if let id = recipe.baseID, let match = bases.first(where: { $0.id == id }) {
            return match.ingredients
        }
        return defaultBase?.ingredients ?? []
    }

    func baseName(for recipe: Recipe) -> String {
        if recipe.customBase != nil { return "Custom base" }
        if let id = recipe.baseID, let match = bases.first(where: { $0.id == id }) {
            return match.name
        }
        return defaultBase?.name ?? "No base"
    }
}

@Observable
final class Store {
    private(set) var library: Library
    /// Surfaced in the UI rather than silently swallowed — a failed save means
    /// the user is about to lose a recipe they just typed.
    var saveError: String?

    private let fileURL: URL
    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.outputFormatting = [.prettyPrinted, .sortedKeys]
        e.dateEncodingStrategy = .iso8601
        return e
    }()
    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        return d
    }()

    init(fileURL: URL? = nil) {
        let url = fileURL ?? Store.defaultFileURL()
        self.fileURL = url
        if let data = try? Data(contentsOf: url),
           let decoded = try? decoder.decode(Library.self, from: data) {
            self.library = decoded
        } else {
            self.library = .seed
            save()
        }
    }

    /// In-memory only — for previews and tests, so they never touch real data.
    init(preview: Library) {
        self.fileURL = URL(fileURLWithPath: "/dev/null")
        self.library = preview
    }

    static func defaultFileURL() -> URL {
        let dir = (try? FileManager.default.url(
            for: .applicationSupportDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )) ?? URL.temporaryDirectory
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appending(path: "churn-library.json")
    }

    // MARK: Persistence

    private func save() {
        guard fileURL.path != "/dev/null" else { return }
        do {
            let data = try encoder.encode(library)
            // Atomic so a crash mid-write can't leave a truncated library behind.
            try data.write(to: fileURL, options: .atomic)
            saveError = nil
        } catch {
            saveError = error.localizedDescription
        }
    }

    private func mutate(_ change: (inout Library) -> Void) {
        change(&library)
        save()
    }

    // MARK: Logs

    /// Every recipe has a log, even an empty one — it just may not be stored yet.
    func log(for id: Recipe.ID) -> Log {
        library.logs.first { $0.recipeID == id } ?? Log(recipeID: id)
    }

    private func withLog(_ id: Recipe.ID, _ change: (inout Log) -> Void) {
        mutate { library in
            if let index = library.logs.firstIndex(where: { $0.recipeID == id }) {
                change(&library.logs[index])
            } else {
                var fresh = Log(recipeID: id)
                change(&fresh)
                library.logs.append(fresh)
            }
        }
    }

    func rating(for id: Recipe.ID) -> Double? { log(for: id).rating }
    func hasBeenMade(_ id: Recipe.ID) -> Bool { log(for: id).hasBeenMade }

    func setRating(_ rating: Double?, for id: Recipe.ID) {
        withLog(id) { $0.rating = rating }
    }

    func setNotes(_ notes: String, for id: Recipe.ID) {
        withLog(id) { $0.notes = notes }
    }

    func togglePin(_ id: Recipe.ID) {
        withLog(id) { $0.isPinned.toggle() }
    }

    func logSpin(_ spin: Spin, for id: Recipe.ID) {
        withLog(id) { log in
            log.spins.insert(spin, at: 0)
            // A rated spin with no overall rating yet seeds the recipe's rating,
            // so the first make-and-rate doesn't need two separate gestures.
            if let rating = spin.rating, log.rating == nil {
                log.rating = rating
            }
        }
    }

    func setAdjustment(_ adjustment: Experiment, done: Bool, for id: Recipe.ID) {
        withLog(id) { log in
            guard let index = log.adjustments.firstIndex(where: { $0.id == adjustment.id })
            else { return }
            log.adjustments[index].isDone = done
        }
    }

    func addAdjustment(_ text: String, for id: Recipe.ID) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        withLog(id) { $0.adjustments.append(Experiment(text: trimmed)) }
    }

    func replaceAdjustments(_ adjustments: [Experiment], for id: Recipe.ID) {
        withLog(id) { $0.adjustments = adjustments }
    }

    // MARK: Recipes

    func add(_ recipe: Recipe) {
        mutate { $0.recipes.append(recipe) }
    }

    func update(_ recipe: Recipe) {
        mutate {
            guard let i = $0.recipes.firstIndex(where: { $0.id == recipe.id }) else { return }
            $0.recipes[i] = recipe
        }
    }

    func delete(_ recipe: Recipe) {
        mutate {
            $0.recipes.removeAll { $0.id == recipe.id }
            $0.logs.removeAll { $0.recipeID == recipe.id }
        }
    }

    func recipe(_ id: Recipe.ID) -> Recipe? {
        library.recipes.first { $0.id == id }
    }

    // MARK: Bases

    func update(_ base: Base) {
        mutate {
            guard let i = $0.bases.firstIndex(where: { $0.id == base.id }) else { return }
            $0.bases[i] = base
        }
    }

    func add(_ base: Base) {
        mutate { $0.bases.append(base) }
    }

    // MARK: Derived

    /// Pinned first, then best-rated, then unrated alphabetically.
    var recipesByRating: [Recipe] {
        library.recipes.sorted { a, b in
            let la = log(for: a.id), lb = log(for: b.id)
            if la.isPinned != lb.isPinned { return la.isPinned }
            switch (la.rating, lb.rating) {
            case let (x?, y?): return x == y ? a.name < b.name : x > y
            case (_?, nil): return true
            case (nil, _?): return false
            case (nil, nil): return a.name < b.name
            }
        }
    }

    /// The two shelf groups.
    var made: [Recipe] { recipesByRating.filter { hasBeenMade($0.id) } }
    var onTheList: [Recipe] { recipesByRating.filter { !hasBeenMade($0.id) } }

    var openAdjustmentCount: Int {
        library.logs.reduce(0) { $0 + $1.openAdjustments.count }
    }

    /// Every unfinished adjustment, with the recipe it belongs to.
    var openAdjustments: [(recipe: Recipe, adjustment: Experiment)] {
        recipesByRating.flatMap { recipe in
            log(for: recipe.id).openAdjustments.map { (recipe, $0) }
        }
    }
}
