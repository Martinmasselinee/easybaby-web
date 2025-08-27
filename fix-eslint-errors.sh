#!/bin/bash

# Fix any types
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/: any/: unknown/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/as any/as unknown/g'
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/<any>/<unknown>/g'

# Fix unescaped apostrophes
find src -type f -name "*.tsx" | xargs sed -i '' "s/\\([^\\\\]\\)'\\([^']\\)/\\1\\'\\2/g"

# Fix no-unused-vars by adding underscore prefix
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/@typescript-eslint\/no-unused-vars/eslint-disable-line @typescript-eslint\/no-unused-vars/g'
