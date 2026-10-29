# Changelog

Generated from Git history by the post-commit hook. Entries are grouped by the app version recorded in each commit.

## 0.9.14

- `dd9f612` feat: enhance ExtraNutrientSummary with visibility control

## 0.9.13

- `7d0dda9` feat: implement changelog generation and update APP_VERSION to 0.9.13

## 0.9.12

- `bdfa4c0` feat: update DayStrip component by removing unused onToday prop and enhancing TodayPage with a new button for quick navigation

## 0.9.2

- `50fe19f` feat: update GradeMark component to support size prop and enhance meal list interactions

## 0.9.0

- `78f871a` feat: implement score insights feature with suggestions and assistant integration

## 0.8.1

- `7ebc726` feat: enhance food editing capabilities with new UI and functionality

## 0.7.2

- `1466b36` fix: move GradeDot component to the portion display for better visibility
- `c052c78` feat: implement customizable Today page layout with section management

## 0.5.4

- `7538499` feat: add compact number formatting and extra nutrients support
  - Implemented `formatCompact` function for localized number formatting.
  - Updated translations to include new nutrient terms and their short forms.
  - Introduced `ExtraNutrientsSchema` for optional nutrient tracking in food items.
  - Enhanced `FoodSchema` to merge extra nutrients with existing nutrient definitions.
  - Added tests for new nutrient functionalities and meal scoring logic.
  - Updated version to 0.5.4 to reflect new features and improvements.

## 0.2.1

- `3239713` feat(i18n): add internationalization support for English and Persian with translation keys and functions
  style(settings): enhance settings page styles for version display and about section
  
  docs(code-style): update code style guidelines to enforce TypeScript for new files and use Tailwind for styling
  
  fix(models): normalize unique keys in logged entries, activities, and templates to prevent duplicates
  
  test(profile): add tests for validation of duplicate and missing keys in logged items and activities
  
  chore(version): bump application version to 0.2.1

## Before version tracking

- `85f495c` Add nutrition label import feature with parsing functionality and UI integration
- `f8f66a9` Enhance meal logging with goal progress indicators and animations
- `1aa4a60` Add meal calorie management features and update related components
  - Introduced meal calorie target calculation and validation functions.
  - Updated profile schema to include meal calorie distribution.
  - Enhanced DailySummary and MealList components to display calorie targets.
  - Modified form fields to allow input for meal calorie shares.
  - Added tests for meal calorie functionality.
- `21ffb46` Update nourish logo SVG and replace icon files
- `4083502` Add new nourish logo SVG and update icon files
- `cec3a1d` Use light blue for low intake in the energy card and day strip
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `366a4b4` Show a skinny black-and-white cat on the low-intake message
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `f9a23c2` Redraw over-goal cat as a lazy, full-bellied tabby with half-lidded eyes
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `9fa1210` Add macro color tokens, styled balance messages and an animated cat
  - Macro colors as theme tokens: protein blue, carbs mint, fat yellow
  - Balance messages become tinted callouts with icons; over-goal uses the vivid orange
  - Over-goal message shows an animated chubby orange cat (breathing, blinking, tail and ears)
  - Document macro tokens in the agent styling guide
  
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `b801cb9` Refactor macro colors to use CSS variables for consistency and maintainability
- `a9efd0c` Use a vivid warning orange for over-goal days in the day strip
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `8ef20e6` Expand avatar picker with pixel characters and colorful identicons
  - Add 24 original pixel-character avatars and 24 identicons with per-seed colors
  - Neutral selection ring, collapsible View all, photo actions beside the heading
  - Allow pixel:N avatar choice in the profile schema
  
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `70f2f44` Give the assistant button a Google-color gradient to set it apart from the app theme
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `ebc7cef` Animate meal icons with a colored glow when food is logged
  Scrolls the meal into view after the add sheet closes, then plays a per-meal icon animation.
  
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `f594cce` Match Progress period navigator to Today's date navigator
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `7a2de11` Share animated report icon between Today and the Progress report card
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `1e2345a` Add avatar options, profile photo and calmer Today header
  - Header avatar can be the name's initial, one of eight GitHub-style identicons, or an uploaded photo (resized on-device), chosen in Settings
  - Add a heartbeat animation to the brand heart
  - Show a single loader on refresh instead of flashing the login page while the session restores
  - Make the Today button neutral; the weekly report shortcut disappears after opening, with a permanent link on Progress
  
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `5dee7ff` Split agent guide into short AGENTS.md index and docs/agents topic files
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `3fb933e` Add shared AGENTS.md agent guide and import it from CLAUDE.md
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `485d94f` Add CLAUDE.md with commands, architecture and styling guidance
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `86d3067` Add launch configuration and update dependencies for icon rendering
- `38bcd66` Fix rolling digit clipping and restyle weekly report message
  - Clip rolling number slots vertically only so wide bold digits aren't cut
  - Anchor the weekly report message to the report icon so its arrow points at it
  - Use the theme accent color for the message instead of yellow
  
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
- `2738377` Add running activity type with levels and integrate into ActivityEditor; enhance icon rendering and styles for better user experience
- `6a9b554` Enhance diary features: integrate saved day goals in DayStrip, add celebration animation in LoggingStreak, and improve TodayPage with report visibility; update styles for better user experience
- `8878144` Add weekly report feature with UI components and logic; enhance DailySummary and TodayPage for integration
- `7e9cc46` Refactor AssistantPage component to remove unused props and streamline navigation; update TodayPage buttons for improved accessibility; enhance mobile input styles for better user experience
- `7716ea2` Refactor ModalSheet and RollingNumber components for improved functionality and readability; update styles for mobile inputs
- `80358af` Add BottomNavigation component and styles for improved navigation
- `5bc6ed5` Remove redundant text from barcode scanner and update styles for improved layout
- `f600123` Move profile settings to header gear and remove redundant toolbar
- `d7db4e4` Remove profile card padding and idle scanner hint
- `ec20317` Remove footer link from barcode scanner
- `08cc57c` Emphasize consumed calories with larger accent typography
- `e7b359e` Compact daily energy details and animate changing number wheels
- `9ba59e2` Compact food library controls and add weekday and home navigation
- `1446a8c` Add secure Gemini assistant preparation and refine mobile navigation and loading
- `ba696b7` Persist personal food cache with explicit refresh and safe library writes
- `3e54ced` Cache account snapshots, retain scanned foods, and prevent iOS input zoom
- `01f71cb` init commit
