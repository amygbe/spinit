#!/usr/bin/env python3
"""Generate Churn.xcodeproj from whatever is currently in Churn/.

Xcode's project file is a merge-conflict machine and a pain to hand-edit, so it
is treated as a build artifact here: add a .swift file to the folder, re-run
this, and the project picks it up.

    python3 tools/generate_xcodeproj.py

Object IDs are derived from a hash of each path, so regenerating an unchanged
project produces a byte-identical file instead of a noisy diff.
"""

from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APP = "Churn"
BUNDLE_ID = "com.churnapp.Churn"
DEPLOYMENT_TARGET = "17.0"
SWIFT_VERSION = "5.0"

SOURCE_DIR = ROOT / APP
PROJECT_DIR = ROOT / f"{APP}.xcodeproj"


def oid(*parts: str) -> str:
    """A stable 24-hex-char object ID for a logical thing in the project."""
    digest = hashlib.sha256("::".join(parts).encode()).hexdigest()
    return digest[:24].upper()


RESOURCE_SUFFIXES = (".ttf", ".otf", ".txt")


def discover() -> tuple[list[Path], list[Path]]:
    """Swift sources and bundled resources, as paths relative to the app folder."""
    sources = sorted(
        p.relative_to(SOURCE_DIR)
        for p in SOURCE_DIR.rglob("*.swift")
    )
    resources = sorted(
        [p.relative_to(SOURCE_DIR) for p in SOURCE_DIR.glob("*.xcassets")]
        # Fonts are registered at runtime from the bundle, so they only need to
        # be copied in — no Info.plist UIAppFonts entry to keep in sync.
        + [
            p.relative_to(SOURCE_DIR)
            for p in SOURCE_DIR.rglob("*")
            if p.suffix.lower() in RESOURCE_SUFFIXES and p.is_file()
        ]
    )
    return sources, resources


def build_group_tree(paths: list[Path]) -> dict:
    """Nest relative paths into {dirname: {...}, "__files__": [Path, ...]}."""
    tree: dict = {"__files__": []}
    for path in paths:
        node = tree
        for part in path.parts[:-1]:
            node = node.setdefault(part, {"__files__": []})
        node["__files__"].append(path)
    return tree


def emit_groups(tree: dict, name: str, prefix: str, lines: list[str]) -> str:
    """Emit PBXGroup entries depth-first; returns this group's object ID."""
    group_id = oid("group", prefix or name)
    children: list[tuple[str, str]] = []

    for key in sorted(k for k in tree if k != "__files__"):
        child_prefix = f"{prefix}/{key}" if prefix else key
        child_id = emit_groups(tree[key], key, child_prefix, lines)
        children.append((child_id, key))

    for path in tree["__files__"]:
        children.append((oid("file", str(path)), path.name))

    body = [f"\t\t{group_id} /* {name} */ = {{", "\t\t\tisa = PBXGroup;", "\t\t\tchildren = ("]
    for child_id, child_name in children:
        body.append(f"\t\t\t\t{child_id} /* {child_name} */,")
    body.append("\t\t\t);")
    if prefix:
        body.append(f"\t\t\tpath = {key_quote(name)};")
    else:
        body.append(f"\t\t\tpath = {key_quote(APP)};")
    body.append("\t\t\tsourceTree = \"<group>\";")
    body.append("\t\t};")
    lines.extend(body)
    return group_id


def key_quote(value: str) -> str:
    safe = all(c.isalnum() or c in "_./" for c in value)
    return value if safe and value else f'"{value}"'


def file_type(path: Path) -> str:
    return {
        ".swift": "sourcecode.swift",
        ".xcassets": "folder.assetcatalog",
        ".ttf": "file",
        ".otf": "file",
        ".txt": "text",
    }.get(path.suffix.lower(), "text")


def generate() -> str:
    sources, resources = discover()
    all_files = sources + resources

    L: list[str] = []
    L.append("// !$*UTF8*$!")
    L.append("{")
    L.append("\tarchiveVersion = 1;")
    L.append("\tclasses = {")
    L.append("\t};")
    L.append("\tobjectVersion = 56;")
    L.append("\tobjects = {")

    # PBXBuildFile
    L.append("\n/* Begin PBXBuildFile section */")
    for path in all_files:
        L.append(
            f"\t\t{oid('build', str(path))} /* {path.name} in Build */ = {{isa = PBXBuildFile; "
            f"fileRef = {oid('file', str(path))} /* {path.name} */; }};"
        )
    L.append("/* End PBXBuildFile section */")

    # PBXFileReference
    L.append("\n/* Begin PBXFileReference section */")
    L.append(
        f"\t\t{oid('product')} /* {APP}.app */ = {{isa = PBXFileReference; "
        f"explicitFileType = wrapper.application; includeInIndex = 0; "
        f'path = {APP}.app; sourceTree = BUILT_PRODUCTS_DIR; }};'
    )
    for path in all_files:
        L.append(
            f"\t\t{oid('file', str(path))} /* {path.name} */ = {{isa = PBXFileReference; "
            f"lastKnownFileType = {file_type(path)}; path = {key_quote(path.name)}; "
            f'sourceTree = "<group>"; }};'
        )
    L.append("/* End PBXFileReference section */")

    # PBXFrameworksBuildPhase
    L.append("\n/* Begin PBXFrameworksBuildPhase section */")
    L.append(f"\t\t{oid('frameworks')} = {{")
    L.append("\t\t\tisa = PBXFrameworksBuildPhase;")
    L.append("\t\t\tbuildActionMask = 2147483647;")
    L.append("\t\t\tfiles = (\n\t\t\t);")
    L.append("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
    L.append("\t\t};")
    L.append("/* End PBXFrameworksBuildPhase section */")

    # PBXGroup
    L.append("\n/* Begin PBXGroup section */")
    group_lines: list[str] = []
    app_group_id = emit_groups(build_group_tree(all_files), APP, "", group_lines)

    products_id = oid("products")
    root_group_id = oid("rootgroup")
    L.append(f"\t\t{root_group_id} = {{")
    L.append("\t\t\tisa = PBXGroup;")
    L.append("\t\t\tchildren = (")
    L.append(f"\t\t\t\t{app_group_id} /* {APP} */,")
    L.append(f"\t\t\t\t{products_id} /* Products */,")
    L.append("\t\t\t);")
    L.append('\t\t\tsourceTree = "<group>";')
    L.append("\t\t};")
    L.append(f"\t\t{products_id} /* Products */ = {{")
    L.append("\t\t\tisa = PBXGroup;")
    L.append("\t\t\tchildren = (")
    L.append(f"\t\t\t\t{oid('product')} /* {APP}.app */,")
    L.append("\t\t\t);")
    L.append("\t\t\tname = Products;")
    L.append('\t\t\tsourceTree = "<group>";')
    L.append("\t\t};")
    L.extend(group_lines)
    L.append("/* End PBXGroup section */")

    # PBXNativeTarget
    L.append("\n/* Begin PBXNativeTarget section */")
    L.append(f"\t\t{oid('target')} /* {APP} */ = {{")
    L.append("\t\t\tisa = PBXNativeTarget;")
    L.append(
        f"\t\t\tbuildConfigurationList = {oid('targetconfiglist')} "
        f'/* Build configuration list for PBXNativeTarget "{APP}" */;'
    )
    L.append("\t\t\tbuildPhases = (")
    L.append(f"\t\t\t\t{oid('sources')} /* Sources */,")
    L.append(f"\t\t\t\t{oid('frameworks')} /* Frameworks */,")
    L.append(f"\t\t\t\t{oid('resources')} /* Resources */,")
    L.append("\t\t\t);")
    L.append("\t\t\tbuildRules = (\n\t\t\t);")
    L.append("\t\t\tdependencies = (\n\t\t\t);")
    L.append(f"\t\t\tname = {APP};")
    L.append(f"\t\t\tproductName = {APP};")
    L.append(f"\t\t\tproductReference = {oid('product')} /* {APP}.app */;")
    L.append('\t\t\tproductType = "com.apple.product-type.application";')
    L.append("\t\t};")
    L.append("/* End PBXNativeTarget section */")

    # PBXProject
    L.append("\n/* Begin PBXProject section */")
    L.append(f"\t\t{oid('project')} /* Project object */ = {{")
    L.append("\t\t\tisa = PBXProject;")
    L.append("\t\t\tattributes = {")
    L.append("\t\t\t\tBuildIndependentTargetsInParallel = 1;")
    L.append("\t\t\t\tLastSwiftUpdateCheck = 1530;")
    L.append("\t\t\t\tLastUpgradeCheck = 1530;")
    L.append("\t\t\t\tTargetAttributes = {")
    L.append(f"\t\t\t\t\t{oid('target')} = {{")
    L.append("\t\t\t\t\t\tCreatedOnToolsVersion = 15.3;")
    L.append("\t\t\t\t\t};")
    L.append("\t\t\t\t};")
    L.append("\t\t\t};")
    L.append(
        f"\t\t\tbuildConfigurationList = {oid('projectconfiglist')} "
        f'/* Build configuration list for PBXProject "{APP}" */;'
    )
    L.append('\t\t\tcompatibilityVersion = "Xcode 14.0";')
    L.append("\t\t\tdevelopmentRegion = en;")
    L.append("\t\t\thasScannedForEncodings = 0;")
    L.append("\t\t\tknownRegions = (\n\t\t\t\ten,\n\t\t\t\tBase,\n\t\t\t);")
    L.append(f"\t\t\tmainGroup = {root_group_id};")
    L.append(f"\t\t\tproductRefGroup = {products_id} /* Products */;")
    L.append('\t\t\tprojectDirPath = "";')
    L.append('\t\t\tprojectRoot = "";')
    L.append("\t\t\ttargets = (")
    L.append(f"\t\t\t\t{oid('target')} /* {APP} */,")
    L.append("\t\t\t);")
    L.append("\t\t};")
    L.append("/* End PBXProject section */")

    # PBXResourcesBuildPhase
    L.append("\n/* Begin PBXResourcesBuildPhase section */")
    L.append(f"\t\t{oid('resources')} /* Resources */ = {{")
    L.append("\t\t\tisa = PBXResourcesBuildPhase;")
    L.append("\t\t\tbuildActionMask = 2147483647;")
    L.append("\t\t\tfiles = (")
    for path in resources:
        L.append(f"\t\t\t\t{oid('build', str(path))} /* {path.name} in Resources */,")
    L.append("\t\t\t);")
    L.append("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
    L.append("\t\t};")
    L.append("/* End PBXResourcesBuildPhase section */")

    # PBXSourcesBuildPhase
    L.append("\n/* Begin PBXSourcesBuildPhase section */")
    L.append(f"\t\t{oid('sources')} /* Sources */ = {{")
    L.append("\t\t\tisa = PBXSourcesBuildPhase;")
    L.append("\t\t\tbuildActionMask = 2147483647;")
    L.append("\t\t\tfiles = (")
    for path in sources:
        L.append(f"\t\t\t\t{oid('build', str(path))} /* {path.name} in Sources */,")
    L.append("\t\t\t);")
    L.append("\t\t\trunOnlyForDeploymentPostprocessing = 0;")
    L.append("\t\t};")
    L.append("/* End PBXSourcesBuildPhase section */")

    # XCBuildConfiguration
    L.append("\n/* Begin XCBuildConfiguration section */")
    for config in ("Debug", "Release"):
        L.append(f"\t\t{oid('projectconfig', config)} /* {config} */ = {{")
        L.append("\t\t\tisa = XCBuildConfiguration;")
        L.append("\t\t\tbuildSettings = {")
        for line in project_settings(config):
            L.append(f"\t\t\t\t{line}")
        L.append("\t\t\t};")
        L.append(f"\t\t\tname = {config};")
        L.append("\t\t};")
    for config in ("Debug", "Release"):
        L.append(f"\t\t{oid('targetconfig', config)} /* {config} */ = {{")
        L.append("\t\t\tisa = XCBuildConfiguration;")
        L.append("\t\t\tbuildSettings = {")
        for line in target_settings(config):
            L.append(f"\t\t\t\t{line}")
        L.append("\t\t\t};")
        L.append(f"\t\t\tname = {config};")
        L.append("\t\t};")
    L.append("/* End XCBuildConfiguration section */")

    # XCConfigurationList
    L.append("\n/* Begin XCConfigurationList section */")
    for kind, isa_name in (("project", "PBXProject"), ("target", "PBXNativeTarget")):
        L.append(
            f"\t\t{oid(kind + 'configlist')} /* Build configuration list for {isa_name} \"{APP}\" */ = {{"
        )
        L.append("\t\t\tisa = XCConfigurationList;")
        L.append("\t\t\tbuildConfigurations = (")
        for config in ("Debug", "Release"):
            L.append(f"\t\t\t\t{oid(kind + 'config', config)} /* {config} */,")
        L.append("\t\t\t);")
        L.append("\t\t\tdefaultConfigurationIsVisible = 0;")
        L.append("\t\t\tdefaultConfigurationName = Release;")
        L.append("\t\t};")
    L.append("/* End XCConfigurationList section */")

    L.append("\t};")
    L.append(f"\trootObject = {oid('project')} /* Project object */;")
    L.append("}")
    return "\n".join(L) + "\n"


def project_settings(config: str) -> list[str]:
    common = [
        "ALWAYS_SEARCH_USER_PATHS = NO;",
        "ASSETCATALOG_COMPILER_GENERATE_SWIFT_ASSET_SYMBOL_EXTENSIONS = YES;",
        "CLANG_ANALYZER_NONNULL = YES;",
        "CLANG_ENABLE_MODULES = YES;",
        "CLANG_ENABLE_OBJC_ARC = YES;",
        "CLANG_WARN_DOCUMENTATION_COMMENTS = YES;",
        "CLANG_WARN_UNREACHABLE_CODE = YES;",
        "COPY_PHASE_STRIP = NO;",
        "ENABLE_STRICT_OBJC_MSGSEND = YES;",
        "GCC_NO_COMMON_BLOCKS = YES;",
        "GCC_WARN_UNDECLARED_SELECTOR = YES;",
        "GCC_WARN_UNUSED_FUNCTION = YES;",
        "GCC_WARN_UNUSED_VARIABLE = YES;",
        f"IPHONEOS_DEPLOYMENT_TARGET = {DEPLOYMENT_TARGET};",
        "MTL_FAST_MATH = YES;",
        "SDKROOT = iphoneos;",
    ]
    if config == "Debug":
        return common + [
            "DEBUG_INFORMATION_FORMAT = dwarf;",
            "ENABLE_TESTABILITY = YES;",
            "GCC_DYNAMIC_NO_PIC = NO;",
            "GCC_OPTIMIZATION_LEVEL = 0;",
            'GCC_PREPROCESSOR_DEFINITIONS = (\n\t\t\t\t\t"DEBUG=1",\n\t\t\t\t\t"$(inherited)",\n\t\t\t\t);',
            "MTL_ENABLE_DEBUG_INFO = INCLUDE_SOURCE;",
            "ONLY_ACTIVE_ARCH = YES;",
            "SWIFT_ACTIVE_COMPILATION_CONDITIONS = DEBUG;",
            'SWIFT_OPTIMIZATION_LEVEL = "-Onone";',
        ]
    return common + [
        'DEBUG_INFORMATION_FORMAT = "dwarf-with-dsym";',
        "ENABLE_NS_ASSERTIONS = NO;",
        "MTL_ENABLE_DEBUG_INFO = NO;",
        "SWIFT_COMPILATION_MODE = wholemodule;",
        "VALIDATE_PRODUCT = YES;",
    ]


def target_settings(config: str) -> list[str]:
    return [
        "ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon;",
        "ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME = AccentColor;",
        "CODE_SIGN_STYLE = Automatic;",
        "CURRENT_PROJECT_VERSION = 1;",
        "ENABLE_PREVIEWS = YES;",
        "GENERATE_INFOPLIST_FILE = YES;",
        'INFOPLIST_KEY_CFBundleDisplayName = "Spin It";',
        "INFOPLIST_KEY_UIApplicationSceneManifest_Generation = YES;",
        "INFOPLIST_KEY_UILaunchScreen_Generation = YES;",
        "INFOPLIST_KEY_UIStatusBarStyle = UIStatusBarStyleDefault;",
        "INFOPLIST_KEY_UISupportedInterfaceOrientations = UIInterfaceOrientationPortrait;",
        'LD_RUNPATH_SEARCH_PATHS = (\n\t\t\t\t\t"$(inherited)",\n\t\t\t\t\t"@executable_path/Frameworks",\n\t\t\t\t);',
        "MARKETING_VERSION = 1.0;",
        f"PRODUCT_BUNDLE_IDENTIFIER = {BUNDLE_ID};",
        'PRODUCT_NAME = "$(TARGET_NAME)";',
        "SWIFT_EMIT_LOC_STRINGS = YES;",
        f"SWIFT_VERSION = {SWIFT_VERSION};",
        "TARGETED_DEVICE_FAMILY = 1;",
    ]


def write_scheme() -> None:
    scheme_dir = PROJECT_DIR / "xcshareddata" / "xcschemes"
    scheme_dir.mkdir(parents=True, exist_ok=True)
    (scheme_dir / f"{APP}.xcscheme").write_text(f"""<?xml version="1.0" encoding="UTF-8"?>
<Scheme LastUpgradeVersion = "1530" version = "1.7">
   <BuildAction parallelizeBuildables = "YES" buildImplicitDependencies = "YES">
      <BuildActionEntries>
         <BuildActionEntry buildForTesting = "YES" buildForRunning = "YES" buildForProfiling = "YES" buildForArchiving = "YES" buildForAnalyzing = "YES">
            <BuildableReference
               BuildableIdentifier = "primary"
               BlueprintIdentifier = "{oid('target')}"
               BuildableName = "{APP}.app"
               BlueprintName = "{APP}"
               ReferencedContainer = "container:{APP}.xcodeproj">
            </BuildableReference>
         </BuildActionEntry>
      </BuildActionEntries>
   </BuildAction>
   <TestAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" shouldUseLaunchSchemeArgsEnv = "YES">
      <Testables>
      </Testables>
   </TestAction>
   <LaunchAction buildConfiguration = "Debug" selectedDebuggerIdentifier = "Xcode.DebuggerFoundation.Debugger.LLDB" selectedLauncherIdentifier = "Xcode.DebuggerFoundation.Launcher.LLDB" launchStyle = "0" useCustomWorkingDirectory = "NO" ignoresPersistentStateOnLaunch = "NO" debugDocumentVersioning = "YES" debugServiceExtension = "internal" allowLocationSimulation = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "{oid('target')}"
            BuildableName = "{APP}.app"
            BlueprintName = "{APP}"
            ReferencedContainer = "container:{APP}.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </LaunchAction>
   <ProfileAction buildConfiguration = "Release" shouldUseLaunchSchemeArgsEnv = "YES" savedToolIdentifier = "" useCustomWorkingDirectory = "NO" debugDocumentVersioning = "YES">
      <BuildableProductRunnable runnableDebuggingMode = "0">
         <BuildableReference
            BuildableIdentifier = "primary"
            BlueprintIdentifier = "{oid('target')}"
            BuildableName = "{APP}.app"
            BlueprintName = "{APP}"
            ReferencedContainer = "container:{APP}.xcodeproj">
         </BuildableReference>
      </BuildableProductRunnable>
   </ProfileAction>
   <AnalyzeAction buildConfiguration = "Debug"></AnalyzeAction>
   <ArchiveAction buildConfiguration = "Release" revealArchiveInOrganizer = "YES"></ArchiveAction>
</Scheme>
""")


def write_workspace() -> None:
    """Create project.xcworkspace if it's missing.

    Xcode makes this folder when it first opens a project and keeps your window
    state inside it. An earlier version of this script deleted the whole
    .xcodeproj before rebuilding, which yanked the workspace out from under a
    running Xcode — hence "The workspace file ... has disappeared". Now the
    file is part of what's generated, so it always exists.
    """
    workspace = PROJECT_DIR / "project.xcworkspace"
    workspace.mkdir(parents=True, exist_ok=True)
    (workspace / "contents.xcworkspacedata").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<Workspace\n'
        '   version = "1.0">\n'
        '   <FileRef\n'
        '      location = "self:">\n'
        '   </FileRef>\n'
        '</Workspace>\n'
    )


def main() -> None:
    if not SOURCE_DIR.exists():
        raise SystemExit(f"No source folder at {SOURCE_DIR}")
    # Rewrite in place rather than deleting the project first: xcuserdata and
    # the workspace live in here too, and they belong to Xcode, not to us.
    PROJECT_DIR.mkdir(parents=True, exist_ok=True)
    (PROJECT_DIR / "project.pbxproj").write_text(generate())
    write_scheme()
    write_workspace()
    sources, resources = discover()
    print(f"Wrote {PROJECT_DIR.relative_to(ROOT)}")
    print(f"  {len(sources)} Swift file(s), {len(resources)} resource bundle(s)")


if __name__ == "__main__":
    main()
