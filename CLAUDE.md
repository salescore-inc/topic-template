# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CSV to JSON template converter tool written in TypeScript. The main functionality is contained in `src/index.ts` which converts CSV data into structured JSON templates for a "Needs Map" application. The project builds a single executable/library using tsup bundler.

## Build and Development Commands

Since this project uses pnpm as the package manager and tsup for building:

- **Build**: Use `pnpm build` to build the project (outputs to `dist/` directory in CJS format for Node.js CLI)
- **Development**: Use `pnpm dev` to run tsup in watch mode
- **Type Check**: Use `npx tsc --noEmit` to run TypeScript type checking
- **Test CLI**: After building, test with `node dist/index.js` or `npx topic-template`

The project is configured as a CLI tool that can be installed globally or run with npx.

## Architecture

### Core Components

- **Main Script**: `src/index.ts` - Contains the complete CSV to JSON conversion logic
- **Type Definitions**: Defines Template, Phase, Section, and Topic types for the structured output
- **CSV Processing**: Uses `csv-parse` library to read and parse CSV input
- **JSON Generation**: Creates structured JSON output with phases, sections, topics, and metadata

### Data Flow

1. Reads CSV file with columns: `phase`, `section`, `topic`, `extractionPrompt`
2. Maps CSV rows to hierarchical structure (Phase → Section → Topic)
3. Assigns colors to phases and indices to sections/topics
4. Outputs JSON template with all structured data

### Expected Usage Pattern

The tool is designed to be run as a CLI command:
```bash
npx topic-template input.csv output.json "Template Name" "Template Description" [category]
```

## TypeScript Configuration

- Target: ES2020
- Module: ESNext  
- Strict mode enabled
- Outputs both type definitions (.d.ts) and source maps
- Bundles all dependencies for standalone distribution