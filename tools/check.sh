#!/bin/bash
# Fast feedback without Xcode.
#
# Until Xcode is installed there is no iOS SDK and nothing can be linked into an
# app, but the Command Line Tools Swift compiler can still catch syntax errors
# across the whole app and fully type-check the parts that only need Foundation.
# That covers the model layer, which is where the logic bugs actually live.
#
#   ./tools/check.sh
#
# Once Xcode is in place, prefer the real thing:
#   xcodebuild -project Churn.xcodeproj -scheme Churn \
#     -destination 'platform=iOS Simulator,name=iPhone 16' build

set -uo pipefail
cd "$(dirname "$0")/.."

fail=0

echo "▸ Parsing every Swift file"
if swiftc -parse $(find Churn -name '*.swift') 2>&1; then
  echo "  ok — no syntax errors"
else
  echo "  FAILED"
  fail=1
fi

echo
echo "▸ Type-checking the model layer (Foundation only, no SwiftUI)"
if swiftc -typecheck Churn/Model/*.swift 2>&1; then
  echo "  ok — models are sound"
else
  echo "  FAILED"
  fail=1
fi

echo
echo "▸ Regenerating the Xcode project"
python3 tools/generate_xcodeproj.py

echo
echo "▸ Validating project.pbxproj"
if plutil -lint Churn.xcodeproj/project.pbxproj >/dev/null; then
  echo "  ok — project file parses"
else
  echo "  FAILED"
  fail=1
fi

echo
if [ "$fail" -eq 0 ]; then
  echo "All checks passed."
else
  echo "Some checks failed."
fi
exit "$fail"
