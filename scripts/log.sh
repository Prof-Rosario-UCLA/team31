#!/usr/bin/env bash
set -euo pipefail

# ======================= SPLIT LOG SCRIPT =======================
# Gathers all source/config files and splits them evenly into
# three logs: log-1.txt, log-2.txt, log-3.txt in project root.
#
# Usage: ./log.sh
# Place as team31/scripts/log.sh then chmod +x log.sh

# 1) Always from scripts/
cd "$(dirname "$0")"
PROJECT_ROOT="$(cd .. && pwd)"
OUTPUT_PREFIX="log"
NUM_PARTS=3

# 2) What to skip & what to include
SKIP_DIRS="node_modules|dist|build|.next|.cache|coverage|public/static"
EXCLUDE_FILES="package-lock.json$|yarn.lock$|pnpm-lock.yaml$|\.map$"
PATTERNS=( \
  "*.js"   "*.jsx"  "*.ts"   "*.tsx" \
  "*.json" "*.yaml" "*.yml"  \
  "*.md"   "*.env"  "*.sh"   \
  "*.config" "*.conf" \
  "*.html" "*.css"  "*.scss" \
  "Dockerfile" "dockerfile" \
)

# 3) Build the -name filters for find
FILTER_ARGS=()
for pat in "${PATTERNS[@]}"; do
  FILTER_ARGS+=( -name "$pat" -o )
done
unset 'FILTER_ARGS[${#FILTER_ARGS[@]}-1]'  # remove trailing -o

# 4) Gather all matching files
mapfile -t ALL_FILES < <(
  find "$PROJECT_ROOT"/{frontend,backend,.github/workflows,deploy} -type f \
    \( "${FILTER_ARGS[@]}" \) \
    ! -path "*/node_modules/*" \
    ! -path "*/dist/*" \
    ! -path "*/build/*" \
    ! -path "*/.next/*" \
    ! -path "*/.cache/*" \
    ! -path "*/coverage/*" \
    ! -path "*/public/static/*" \
  | grep -Ev "$EXCLUDE_FILES" \
  | sort
)

TOTAL=${#ALL_FILES[@]}
if (( TOTAL == 0 )); then
  echo "No files found to log." >&2
  exit 1
fi

# 5) Compute chunk size (ceiling)
CHUNK=$(( (TOTAL + NUM_PARTS - 1) / NUM_PARTS ))

# 6) Separator printer
print_sep(){
  local char="$1"
  printf "%64s\n" "" | tr ' ' "$char"
}

# 7) Emit each part
for (( part=1; part<=NUM_PARTS; part++ )); do
  OUTPUT="$PROJECT_ROOT/${OUTPUT_PREFIX}-${part}.txt"
  : > "$OUTPUT"

  start=$(( (part-1)*CHUNK ))
  end=$(( start + CHUNK - 1 ))
  (( end >= TOTAL )) && end=$(( TOTAL - 1 ))

  printf "\n=== Log Part %d of %d: files %d–%d of %d ===\n\n" \
    "$part" "$NUM_PARTS" "$((start+1))" "$((end+1))" "$TOTAL" >> "$OUTPUT"

  for (( i=start; i<=end; i++ )); do
    file="${ALL_FILES[i]}"
    rel="${file#$PROJECT_ROOT/}"

    {
      # header
      print_sep '='
      printf " 📄 %s\n" "$rel"
      print_sep '='
      echo
      # content
      cat "$file"
      echo
    } >> "$OUTPUT"
  done

  echo "✅ Wrote $OUTPUT ($((end-start+1)) files)"
done

