export const CHANGELOG = [
  {
    "version": "0.9.15",
    "entries": [
      {
        "hash": "8eb4b83",
        "subject": "feat: add changelog data structure and enhance settings panel with release notes display",
        "body": ""
      }
    ]
  },
  {
    "version": "0.9.14",
    "entries": [
      {
        "hash": "dd9f612",
        "subject": "feat: enhance ExtraNutrientSummary with visibility control",
        "body": ""
      }
    ]
  },
  {
    "version": "0.9.13",
    "entries": [
      {
        "hash": "7d0dda9",
        "subject": "feat: implement changelog generation and update APP_VERSION to 0.9.13",
        "body": ""
      }
    ]
  },
  {
    "version": "0.9.12",
    "entries": [
      {
        "hash": "bdfa4c0",
        "subject": "feat: update DayStrip component by removing unused onToday prop and enhancing TodayPage with a new button for quick navigation",
        "body": ""
      }
    ]
  },
  {
    "version": "0.9.2",
    "entries": [
      {
        "hash": "50fe19f",
        "subject": "feat: update GradeMark component to support size prop and enhance meal list interactions",
        "body": ""
      }
    ]
  },
  {
    "version": "0.9.0",
    "entries": [
      {
        "hash": "78f871a",
        "subject": "feat: implement score insights feature with suggestions and assistant integration",
        "body": ""
      }
    ]
  },
  {
    "version": "0.8.1",
    "entries": [
      {
        "hash": "7ebc726",
        "subject": "feat: enhance food editing capabilities with new UI and functionality",
        "body": ""
      }
    ]
  },
  {
    "version": "0.7.2",
    "entries": [
      {
        "hash": "c052c78",
        "subject": "feat: implement customizable Today page layout with section management",
        "body": ""
      },
      {
        "hash": "1466b36",
        "subject": "fix: move GradeDot component to the portion display for better visibility",
        "body": ""
      }
    ]
  },
  {
    "version": "0.5.4",
    "entries": [
      {
        "hash": "7538499",
        "subject": "feat: add compact number formatting and extra nutrients support",
        "body": "- Implemented `formatCompact` function for localized number formatting.\n- Updated translations to include new nutrient terms and their short forms.\n- Introduced `ExtraNutrientsSchema` for optional nutrient tracking in food items.\n- Enhanced `FoodSchema` to merge extra nutrients with existing nutrient definitions.\n- Added tests for new nutrient functionalities and meal scoring logic.\n- Updated version to 0.5.4 to reflect new features and improvements."
      }
    ]
  },
  {
    "version": "0.2.1",
    "entries": [
      {
        "hash": "3239713",
        "subject": "feat(i18n): add internationalization support for English and Persian with translation keys and functions",
        "body": "style(settings): enhance settings page styles for version display and about section\n\ndocs(code-style): update code style guidelines to enforce TypeScript for new files and use Tailwind for styling\n\nfix(models): normalize unique keys in logged entries, activities, and templates to prevent duplicates\n\ntest(profile): add tests for validation of duplicate and missing keys in logged items and activities\n\nchore(version): bump application version to 0.2.1"
      }
    ]
  },
  {
    "version": "Before version tracking",
    "entries": [
      {
        "hash": "01f71cb",
        "subject": "init commit",
        "body": ""
      },
      {
        "hash": "3e54ced",
        "subject": "Cache account snapshots, retain scanned foods, and prevent iOS input zoom",
        "body": ""
      },
      {
        "hash": "ba696b7",
        "subject": "Persist personal food cache with explicit refresh and safe library writes",
        "body": ""
      },
      {
        "hash": "1446a8c",
        "subject": "Add secure Gemini assistant preparation and refine mobile navigation and loading",
        "body": ""
      },
      {
        "hash": "9ba59e2",
        "subject": "Compact food library controls and add weekday and home navigation",
        "body": ""
      },
      {
        "hash": "e7b359e",
        "subject": "Compact daily energy details and animate changing number wheels",
        "body": ""
      },
      {
        "hash": "08cc57c",
        "subject": "Emphasize consumed calories with larger accent typography",
        "body": ""
      },
      {
        "hash": "ec20317",
        "subject": "Remove footer link from barcode scanner",
        "body": ""
      },
      {
        "hash": "d7db4e4",
        "subject": "Remove profile card padding and idle scanner hint",
        "body": ""
      },
      {
        "hash": "f600123",
        "subject": "Move profile settings to header gear and remove redundant toolbar",
        "body": ""
      },
      {
        "hash": "5bc6ed5",
        "subject": "Remove redundant text from barcode scanner and update styles for improved layout",
        "body": ""
      },
      {
        "hash": "80358af",
        "subject": "Add BottomNavigation component and styles for improved navigation",
        "body": ""
      },
      {
        "hash": "7716ea2",
        "subject": "Refactor ModalSheet and RollingNumber components for improved functionality and readability; update styles for mobile inputs",
        "body": ""
      },
      {
        "hash": "7e9cc46",
        "subject": "Refactor AssistantPage component to remove unused props and streamline navigation; update TodayPage buttons for improved accessibility; enhance mobile input styles for better user experience",
        "body": ""
      },
      {
        "hash": "8878144",
        "subject": "Add weekly report feature with UI components and logic; enhance DailySummary and TodayPage for integration",
        "body": ""
      },
      {
        "hash": "6a9b554",
        "subject": "Enhance diary features: integrate saved day goals in DayStrip, add celebration animation in LoggingStreak, and improve TodayPage with report visibility; update styles for better user experience",
        "body": ""
      },
      {
        "hash": "2738377",
        "subject": "Add running activity type with levels and integrate into ActivityEditor; enhance icon rendering and styles for better user experience",
        "body": ""
      },
      {
        "hash": "38bcd66",
        "subject": "Fix rolling digit clipping and restyle weekly report message",
        "body": "- Clip rolling number slots vertically only so wide bold digits aren't cut\n- Anchor the weekly report message to the report icon so its arrow points at it\n- Use the theme accent color for the message instead of yellow\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "86d3067",
        "subject": "Add launch configuration and update dependencies for icon rendering",
        "body": ""
      },
      {
        "hash": "485d94f",
        "subject": "Add CLAUDE.md with commands, architecture and styling guidance",
        "body": "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "3fb933e",
        "subject": "Add shared AGENTS.md agent guide and import it from CLAUDE.md",
        "body": "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "5dee7ff",
        "subject": "Split agent guide into short AGENTS.md index and docs/agents topic files",
        "body": "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "1e2345a",
        "subject": "Add avatar options, profile photo and calmer Today header",
        "body": "- Header avatar can be the name's initial, one of eight GitHub-style identicons, or an uploaded photo (resized on-device), chosen in Settings\n- Add a heartbeat animation to the brand heart\n- Show a single loader on refresh instead of flashing the login page while the session restores\n- Make the Today button neutral; the weekly report shortcut disappears after opening, with a permanent link on Progress\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "7a2de11",
        "subject": "Share animated report icon between Today and the Progress report card",
        "body": "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "f594cce",
        "subject": "Match Progress period navigator to Today's date navigator",
        "body": "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "ebc7cef",
        "subject": "Animate meal icons with a colored glow when food is logged",
        "body": "Scrolls the meal into view after the add sheet closes, then plays a per-meal icon animation.\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "70f2f44",
        "subject": "Give the assistant button a Google-color gradient to set it apart from the app theme",
        "body": "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "8ef20e6",
        "subject": "Expand avatar picker with pixel characters and colorful identicons",
        "body": "- Add 24 original pixel-character avatars and 24 identicons with per-seed colors\n- Neutral selection ring, collapsible View all, photo actions beside the heading\n- Allow pixel:N avatar choice in the profile schema\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "a9efd0c",
        "subject": "Use a vivid warning orange for over-goal days in the day strip",
        "body": "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "b801cb9",
        "subject": "Refactor macro colors to use CSS variables for consistency and maintainability",
        "body": ""
      },
      {
        "hash": "9fa1210",
        "subject": "Add macro color tokens, styled balance messages and an animated cat",
        "body": "- Macro colors as theme tokens: protein blue, carbs mint, fat yellow\n- Balance messages become tinted callouts with icons; over-goal uses the vivid orange\n- Over-goal message shows an animated chubby orange cat (breathing, blinking, tail and ears)\n- Document macro tokens in the agent styling guide\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "f9a23c2",
        "subject": "Redraw over-goal cat as a lazy, full-bellied tabby with half-lidded eyes",
        "body": "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "366a4b4",
        "subject": "Show a skinny black-and-white cat on the low-intake message",
        "body": "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "cec3a1d",
        "subject": "Use light blue for low intake in the energy card and day strip",
        "body": "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
      },
      {
        "hash": "4083502",
        "subject": "Add new nourish logo SVG and update icon files",
        "body": ""
      },
      {
        "hash": "21ffb46",
        "subject": "Update nourish logo SVG and replace icon files",
        "body": ""
      },
      {
        "hash": "1aa4a60",
        "subject": "Add meal calorie management features and update related components",
        "body": "- Introduced meal calorie target calculation and validation functions.\n- Updated profile schema to include meal calorie distribution.\n- Enhanced DailySummary and MealList components to display calorie targets.\n- Modified form fields to allow input for meal calorie shares.\n- Added tests for meal calorie functionality."
      },
      {
        "hash": "f8f66a9",
        "subject": "Enhance meal logging with goal progress indicators and animations",
        "body": ""
      },
      {
        "hash": "85f495c",
        "subject": "Add nutrition label import feature with parsing functionality and UI integration",
        "body": ""
      }
    ]
  }
] as const;
