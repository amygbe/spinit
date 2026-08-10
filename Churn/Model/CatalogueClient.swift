import Foundation

/// Talks to the shared catalogue at churn.ameliagracebell.workers.dev.
///
/// Two calls, mirroring the two things the server does: read the approved
/// recipes, and submit one for review. There is no polling — the catalogue is
/// fetched when the screen opens or the user pulls to refresh, and the
/// server's own cache headers make repeat fetches nearly free.
enum CatalogueClient {
    static let baseURL = URL(string: "https://spinit.ameliagracebell.workers.dev")!

    enum ClientError: LocalizedError {
        case offline
        case server(String)

        var errorDescription: String? {
            switch self {
            case .offline:
                "Couldn't reach the catalogue. Are you online?"
            case .server(let message):
                message
            }
        }
    }

    // MARK: Reading

    /// A recipe as the server sends it. Strings rather than enums, because the
    /// app must not crash if the server grows a new unit or swatch — unknown
    /// values fall back instead.
    struct WireRecipe: Codable, Identifiable {
        var id: String
        var origin: String?
        var name: String
        var author: String
        var glyph: String
        var swatch: String
        var method: String?
        var ingredients: [WireIngredient]
        var customBase: [WireIngredient]?
    }

    struct WireIngredient: Codable {
        var name: String
        var amount: Double?
        var unit: String
        var role: String
        var note: String?
        var isOptional: Bool?
    }

    private struct CataloguePayload: Codable {
        var version: Int
        var count: Int
        var recipes: [WireRecipe]
    }

    static func fetchCatalogue() async throws -> [WireRecipe] {
        var request = URLRequest(url: baseURL.appending(path: "catalogue"))
        request.timeoutInterval = 15
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
                throw ClientError.server("The catalogue isn't answering right now.")
            }
            return try JSONDecoder().decode(CataloguePayload.self, from: data).recipes
        } catch let error as ClientError {
            throw error
        } catch is DecodingError {
            throw ClientError.server("The catalogue sent something unexpected.")
        } catch {
            throw ClientError.offline
        }
    }

    // MARK: Submitting

    private struct SubmitResponse: Codable {
        var ok: Bool?
        var error: String?
    }

    /// Sends one of the user's own recipes to the review queue. Only the
    /// shareable half travels — ratings, spins and adjustments stay local.
    static func submit(_ recipe: Recipe, author: String) async throws {
        var body: [String: Any] = [
            "name": recipe.name,
            "author": author,
            "glyph": recipe.glyph,
            "swatch": recipe.swatch.rawValue,
            "method": recipe.method,
            "ingredients": recipe.ingredients.map(wire),
        ]
        if let customBase = recipe.customBase {
            body["customBase"] = customBase.map(wire)
        }

        var request = URLRequest(url: baseURL.appending(path: "submit"))
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "content-type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        request.timeoutInterval = 15

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw ClientError.offline
        }

        guard let http = response as? HTTPURLResponse else { throw ClientError.offline }
        if http.statusCode == 201 { return }
        let decoded = try? JSONDecoder().decode(SubmitResponse.self, from: data)
        throw ClientError.server(decoded?.error ?? "The catalogue said no (\(http.statusCode)).")
    }

    private static func wire(_ ingredient: Ingredient) -> [String: Any] {
        var out: [String: Any] = [
            "name": ingredient.name,
            "unit": ingredient.unit.rawValue,
            "role": ingredient.role.rawValue,
            "note": ingredient.note,
            "isOptional": ingredient.isOptional,
        ]
        if let amount = ingredient.amount { out["amount"] = amount }
        return out
    }
}

// MARK: - Wire → local

extension CatalogueClient.WireRecipe {
    /// Convert to a local Recipe. The server's UUID is kept, which is what
    /// makes "already on your shelf" detectable and re-saving harmless.
    func asRecipe() -> Recipe {
        Recipe(
            id: UUID(uuidString: id) ?? UUID(),
            name: name,
            customBase: customBase.map { $0.map { $0.asIngredient() } },
            ingredients: ingredients.map { $0.asIngredient() },
            method: method ?? "",
            swatch: Swatch(rawValue: swatch) ?? .vanilla,
            glyph: glyph,
            author: author,
            // The server says how a recipe got in; the author's display name
            // proves nothing, since anyone can type "Amy".
            origin: origin == "community" ? .community : .curated
        )
    }
}

extension CatalogueClient.WireIngredient {
    func asIngredient() -> Ingredient {
        Ingredient(
            name,
            amount: amount,
            unit: Unit(rawValue: unit) ?? .whole,
            role: IngredientRole(rawValue: role) ?? .flavour,
            note: note ?? "",
            isOptional: isOptional ?? false
        )
    }
}
