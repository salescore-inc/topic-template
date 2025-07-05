# @salescore-inc/topic-template

CSV to JSON template converter tool for creating structured "Needs Map" templates. This CLI tool converts CSV data into hierarchical JSON format with phases, sections, and topics.

## Installation

Install globally:
```bash
npm install -g @salescore-inc/topic-template
```

Or use directly with npx:
```bash
npx @salescore-inc/topic-template
```

## Usage

```bash
topic-template <input.csv> <output.json> <name> <description> [category]
```

### Arguments

- `input.csv`: Path to the input CSV file
- `output.json`: Path to the output JSON file  
- `name`: Template name
- `description`: Template description
- `category`: (Optional) Template category (default: "general")

### Example

```bash
npx @salescore-inc/topic-template input.csv output.json "Recruitment Template" "Needs mapping template for recruitment process" "recruitment"
```

## CSV Format

The CSV file must have the following 4 columns:

| phase | section | topic | extractionPrompt |
|-------|---------|-------|------------------|
| Issue-1 | Candidate Pool | Contact Count | Extract mentions of the number of students who had any contact with the company |
| Issue-1 | Candidate Pool | Applicant Count | Extract mentions of the actual number of students who applied |

- **phase**: Main category (phase)
- **section**: Sub-category (section)  
- **topic**: Specific item (topic)
- **extractionPrompt**: Extraction criteria or definition for data analysis

## Output Structure

The tool generates a structured JSON template with:
- Hierarchical organization (phases → sections → topics)
- Auto-generated colors for phases
- Sequential indexing for sections and topics
- Metadata including name, description, and category

## Development

This project uses pnpm as the package manager and tsup for building.

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Development mode with file watching
pnpm dev

# Type checking
npx tsc --noEmit

# Test the CLI after building
node dist/index.js
```

## Project Structure

- `src/index.ts` - Main conversion logic and CLI interface
- `dist/` - Built output (CJS format for Node.js CLI)
- Built as standalone executable using tsup bundler

## Dependencies

- `csv-parse` - CSV parsing library
- TypeScript with strict mode enabled
- Target: ES2020, Module: ESNext

## License

MIT

## Repository

[https://github.com/salescore-inc/topic-template](https://github.com/salescore-inc/topic-template)