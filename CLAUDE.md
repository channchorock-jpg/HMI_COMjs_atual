# CLAUDE.md - HMI-DARK_COMjs Project Guide

**Last Updated**: 2025-11-15
**Project**: HMI-DARK_COMjs (TwinCAT HMI Industrial Control System)
**Company**: SIMEROS
**Purpose**: Industrial automation HMI for Sensor Control Unit (SCU) operations

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Repository Structure](#repository-structure)
4. [Development Workflows](#development-workflows)
5. [Code Conventions](#code-conventions)
6. [Key Components](#key-components)
7. [Working with This Codebase](#working-with-this-codebase)
8. [Common Tasks](#common-tasks)
9. [Testing & Deployment](#testing--deployment)
10. [Important Notes for AI Assistants](#important-notes-for-ai-assistants)

---

## Project Overview

### What is This Project?
This is a **TwinCAT HMI (Human-Machine Interface)** application for industrial automation, specifically designed to control and monitor **Sensor Control Units (SCU)** in manufacturing or process control environments.

### Key Features
- **PID Control**: Advanced process control with PID algorithms
- **Sensor Monitoring**: Real-time sensor data visualization
- **Manifold Control**: Complete manifold panel operations
- **Alarm Management**: Event logging and alarm handling
- **User Management**: Role-based access control
- **Data Logging**: SQLite-based historical data storage
- **Multi-Language Support**: English and German localization
- **Dark Theme**: Optimized for industrial environments
- **PWA Support**: Offline operation and mobile deployment

### Application Type
- **Platform**: Beckhoff TwinCAT HMI Framework 1.12.762.x
- **IDE**: TwinCAT XAE Shell (Visual Studio-based)
- **Build System**: MSBuild
- **Communication**: ADS Protocol (Automation Device Specification) to PLC

---

## Technology Stack

### Primary Technologies
- **JavaScript (ES2020)**: Main programming language for custom functions
- **HTML5**: UI markup for pages and user controls
- **CSS3**: Styling and theming
- **JSON**: Configuration and data structures
- **TypeScript 4.9.5**: Type checking support (configured, not heavily used)

### Framework & Runtime
- **TwinCAT HMI Framework 12.762.x**: Core framework from Beckhoff
- **TwinCAT HMI Server**: Server-side runtime
- **ADS/AMS Protocol**: PLC communication
- **WebSockets**: Real-time data binding

### Server Extensions
| Extension | Purpose |
|-----------|---------|
| ADS | Communication with TwinCAT PLC runtime |
| TcHmiLua | Lua scripting support |
| TcHmiScope | Data visualization and trending |
| TcHmiSqliteHistorize | Historical data storage |
| TcHmiSqliteLogger | Event and error logging |
| TcHmiUserManagement | Authentication and authorization |

### Build Tools
- **MSBuild**: Project compilation
- **NuGet**: Package management
- **TypeScript Compiler**: Code validation

---

## Repository Structure

```
HMI-DARK_COMjs/
├── .git/                           # Git repository
├── .gitignore                      # Visual Studio .gitignore
├── .gitattributes                  # Git line ending configuration
├── HMI_Dark.sln                    # Visual Studio solution file
├── HMI_Dark.tnzip                  # TwinCAT archive (backup/distribution)
└── HMI_Dark/                       # Main project directory
    ├── Properties/                 # Project configuration
    │   ├── tchmiconfig.json        # ⭐ Main HMI configuration
    │   ├── tchmimanifest.json      # PWA manifest
    │   └── tchmipublish.config.json # Publishing settings
    ├── Functions/                  # ⭐ Custom JavaScript functions (16 files)
    │   ├── SetControlColor.js
    │   ├── BindSensorToNumericInput.js
    │   └── [...13 more functions]
    ├── Pages/                      # ⭐ Content pages (7 pages)
    │   ├── LoginPage.html          # Entry point
    │   ├── HOME.content
    │   ├── Contole.content         # Main control interface
    │   ├── Configurações.content   # Settings
    │   ├── Alarmes.content         # Alarm management
    │   ├── TecladoVirtual.content  # Virtual keyboard
    │   └── HostContent.content
    ├── User_Contols/               # ⭐ Reusable UI components
    │   ├── 0.Controle/             # Control components
    │   │   ├── SCU_Feed_Setpoint.usercontrol
    │   │   ├── SCU_PID.usercontrol
    │   │   ├── SCU_Limites.usercontrol
    │   │   ├── SCU_Painel_Manifold_Completo.usercontrol
    │   │   └── Limites_e_Erro.usercontrol
    │   └── 1.Headers/              # Header components
    │       └── SCU_select.usercontrol
    ├── Server/                     # Server-side configurations
    │   ├── ADS/
    │   ├── TcHmiSrv/
    │   └── TcHmiUserManagement/
    ├── Themes/                     # Visual themes
    │   ├── Base/                   # Light theme
    │   └── Base-Dark/              # ⭐ Active dark theme
    │       ├── Base-Dark.theme
    │       └── Base-DarkStyle.css
    ├── Images/                     # Image assets (47 files)
    │   ├── Manifest/               # PWA launcher icons
    │   ├── PLC/                    # PLC status icons
    │   ├── TwinCAT/                # TwinCAT status icons
    │   └── SIMEROS/                # Company branding
    ├── Localization/               # Multi-language support
    │   ├── en.localization         # English
    │   └── de.localization         # German
    ├── KeyboardLayouts/            # Virtual keyboard layouts
    ├── Fonts/                      # Custom fonts (Roboto Condensed)
    ├── Desktop.view                # ⭐ Main desktop layout
    ├── tsconfig.json               # TypeScript configuration
    ├── packages.config             # NuGet package references
    └── HMI_Dark.hmiproj           # ⭐ MSBuild project file
```

### Key Files Reference

| File Path | Purpose |
|-----------|---------|
| `HMI_Dark/Properties/tchmiconfig.json` | Main configuration (theme, resolution, login page) |
| `HMI_Dark/Desktop.view` | Main application layout and navigation |
| `HMI_Dark/Pages/LoginPage.html` | Authentication entry point |
| `HMI_Dark/Pages/Contole.content` | Primary control interface |
| `HMI_Dark/HMI_Dark.hmiproj` | MSBuild project file |
| `HMI_Dark.sln` | Visual Studio solution |

---

## Development Workflows

### Prerequisites
- **TwinCAT XAE Shell** (Visual Studio Shell with TwinCAT integration)
- **TwinCAT HMI Engineering** (version 1.12.762.x)
- **.NET Framework** (for MSBuild)
- **Git** for version control

### Opening the Project
```bash
# Option 1: Open solution in Visual Studio
# Double-click HMI_Dark.sln or use TwinCAT XAE Shell

# Option 2: Build from command line
msbuild HMI_Dark.sln /p:Configuration=Release
```

### Development Cycle
1. **Edit Code**: Modify .js files in `Functions/` or .usercontrol files
2. **Auto-Compile**: TypeScript files compile on save (if configured)
3. **Build Project**: Use MSBuild or Visual Studio build
4. **Test in Browser**: HMI server hosts on `http://localhost:PORT`
5. **Deploy**: Publish to target HMI panel or runtime

### Git Workflow
```bash
# Current development branch
git checkout claude/claude-md-mi0sc1o10ccfp16o-01HvUU7YERUM8aJiHnksFKWJ

# Standard workflow
git add .
git commit -m "Description of changes"
git push -u origin claude/claude-md-mi0sc1o10ccfp16o-01HvUU7YERUM8aJiHnksFKWJ
```

---

## Code Conventions

### Naming Conventions

#### Files and Components
- **Functions**: PascalCase (e.g., `SetControlColor.js`)
- **User Controls**: Prefix with `SCU_` + PascalCase (e.g., `SCU_PID.usercontrol`)
- **Pages**: PascalCase or Portuguese names (e.g., `Configurações.content`)
- **Themes**: Hyphenated (e.g., `Base-Dark.theme`)

#### Variables and Parameters (JavaScript)
- **camelCase** for local variables: `var controlElement = ...`
- **PascalCase** for function parameters: `function SetControlColor(ControlId, ColorValue)`
- **Prefixes** for type indication:
  - `st` - Structure/object types
  - `f` - Float/real numbers
  - `i` - Integer
  - `b` - Boolean
  - `e` - Enum
  - `s` - String

#### Symbol Bindings (PLC Variables)
```javascript
// PLC symbol binding syntax
%s%PLC1.MAIN.stSensor.fTemperature%/s%
```

### JavaScript Code Patterns

#### Standard Function Structure
Every custom function follows this namespace pattern:

```javascript
(function (TcHmi) {
    var Functions;
    (function (Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {
            // Function implementation
            function FunctionName(Param1, Param2) {
                // Type checking
                if (typeof Param1 !== 'string') {
                    console.error('Invalid parameter type');
                    return;
                }

                // Implementation logic
                var result = TcHmi.Symbol.readEx('%s%' + Param1 + '%/s%');

                // Return value
                return result;
            }

            // Register function with framework
            TcHmi.Functions.registerFunctionEx(
                'FunctionName',
                'TcHmi.Functions.HMI_Dark',
                FunctionName
            );

        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
```

#### Common Patterns

**Reading PLC Symbols**:
```javascript
var value = TcHmi.Symbol.readEx('%s%PLC1.MAIN.stData.fValue%/s%');
```

**Writing PLC Symbols**:
```javascript
TcHmi.Symbol.writeEx('%s%PLC1.MAIN.stData.fSetpoint%/s%', 25.5);
```

**Control Manipulation**:
```javascript
var control = TcHmi.Controls.get(controlId);
if (control) {
    control.setBackgroundColor(TcHmi.Color.fromString('rgba(255,0,0,1)'));
}
```

**Async Operations**:
```javascript
TcHmi.Symbol.writeEx('%s%Symbol%/s%', value, function(data) {
    if (data.error === TcHmi.Errors.NONE) {
        // Success
    }
});
```

### File Pairing Convention
Each component has multiple related files:

**Functions**:
- `FunctionName.js` - Implementation
- `FunctionName.function.json` - Metadata (parameters, return type)

**User Controls**:
- `ControlName.usercontrol` - HTML/XAML-like markup
- `ControlName.usercontrol.json` - Configuration and properties

**Configuration**:
- `Extension.Config.default.json` - Default configuration
- `Extension.Config.remote.json` - Remote/override configuration

---

## Key Components

### Custom Functions (16 Total)

Located in `HMI_Dark/Functions/`

| Function | Purpose | Key Parameters |
|----------|---------|----------------|
| `SetControlColor` | Changes control background color | ControlId, ColorValue |
| `RestoreControlColor` | Resets control to original color | ControlId |
| `SetControlBoxShadow` | Applies visual effects | ControlId, ShadowValue |
| `BindSensorToNumericInput` | Data binding helper | SensorSymbol, ControlId |
| `ConvertTimeToReal` | Time format conversion | TimeValue |
| `CopyNumericToUCParam` | Copy values to user control | SourceId, TargetParam |
| `CopyNumericToUCParamAsync` | Async parameter copying | SourceId, TargetParam |
| `WriteRealToSymbol` | Write float to PLC | SymbolName, Value |
| `WriteIntAndControlValueToSymbol` | Multi-value write | SymbolName, IntValue, ControlValue |
| `ImprimirValorControle` | Log control values | ControlId |
| `ScuWriteStatusBar` | Update status bar | Message |
| `ReadUCParamToLog` | Debug parameter logging | ParameterName |
| `UpdateLanguageIcon` | Switch language display | LanguageCode |
| `getValueFromSymbolExpression` | Parse symbol values | SymbolExpression |
| `TestFuncion` | Testing utility | - |
| `__resolveControl` | Internal control helper | ControlId |

### Pages (7 Total)

| Page | Purpose | File Location |
|------|---------|---------------|
| Login | User authentication | `Pages/LoginPage.html` |
| HOME | Dashboard | `Pages/HOME.content` |
| Contole | Main control interface | `Pages/Contole.content` |
| Configurações | Settings | `Pages/Configurações.content` |
| Alarmes | Alarm management | `Pages/Alarmes.content` |
| TecladoVirtual | Virtual keyboard | `Pages/TecladoVirtual.content` |
| HostContent | Dynamic content container | `Pages/HostContent.content` |

### User Controls (8 Total)

Located in `HMI_Dark/User_Contols/`

**Control Components** (`0.Controle/`):
- `SCU_Feed_Setpoint` - Feed setpoint control
- `SCU_PID` - PID controller interface
- `SCU_Limites` - Limit configuration
- `SCU_Painel_Manifold_Completo` - Complete manifold panel
- `Limites_e_Erro` - Error and limit handling
- `UserControl1` - Generic control template

**Header Components** (`1.Headers/`):
- `SCU_select` - Sensor/control selection header

### Themes

**Active Theme**: `Base-Dark`
- Location: `HMI_Dark/Themes/Base-Dark/`
- Main file: `Base-Dark.theme`
- Stylesheet: `Base-DarkStyle.css`
- Optimized for: Industrial environments (reduced eye strain)

**Alternative Theme**: `Base` (Light theme)

---

## Working with This Codebase

### Adding a New Function

1. **Create function file**: `HMI_Dark/Functions/MyNewFunction.js`
2. **Use standard template**:
```javascript
(function (TcHmi) {
    var Functions;
    (function (Functions) {
        var HMI_Dark;
        (function (HMI_Dark) {
            function MyNewFunction(Param1, Param2) {
                // Implementation
                console.log('MyNewFunction called with:', Param1, Param2);
                return true;
            }

            TcHmi.Functions.registerFunctionEx(
                'MyNewFunction',
                'TcHmi.Functions.HMI_Dark',
                MyNewFunction
            );
        })(HMI_Dark = Functions.HMI_Dark || (Functions.HMI_Dark = {}));
    })(Functions = TcHmi.Functions || (TcHmi.Functions = {}));
})(TcHmi);
```

3. **Create metadata file**: `HMI_Dark/Functions/MyNewFunction.function.json`
```json
{
  "$schema": "../../../Packages/Beckhoff.TwinCAT.HMI.Framework.12.762.53/runtimes/native1.12-tchmi/Schema/FunctionDescription.Schema.json",
  "name": "MyNewFunction",
  "displayName": "My New Function",
  "visible": true,
  "description": "Description of what this function does",
  "category": "Custom",
  "params": [
    {
      "name": "Param1",
      "displayName": "Parameter 1",
      "type": "tchmi:general#/definitions/String",
      "description": "First parameter description"
    }
  ],
  "returnType": "tchmi:general#/definitions/Boolean",
  "heritable": true,
  "version": {
    "full": "1.0.0.0",
    "major": 1,
    "minor": 0,
    "build": 0,
    "revision": 0
  }
}
```

4. **Add to project**: Include in `HMI_Dark.hmiproj` (usually auto-detected)

### Adding a New User Control

1. **Create in Visual Studio**: Right-click `User_Contols/` → Add → New Item → TwinCAT HMI User Control
2. **Name with SCU_ prefix**: `SCU_MyControl.usercontrol`
3. **Edit markup**: Add controls and layout
4. **Add properties**: Define in .usercontrol.json
5. **Use in pages**: Reference from content pages

### Modifying Themes

**Dark Theme Stylesheet**: `HMI_Dark/Themes/Base-Dark/Base-DarkStyle.css`

```css
/* Example: Modify button colors */
.TcHmi_Controls_Beckhoff_TcHmiButton {
    background-color: #2a2a2a;
    color: #ffffff;
}
```

### Working with PLC Symbols

**ADS Configuration**: `HMI_Dark/Server/ADS/ADS.Config.default.json`
- AmsNetId: `127.0.0.1.1.1` (local PLC)
- Port: `851` (TwinCAT PLC runtime)

**Symbol Naming Convention**:
```
%s%PLC1.MAIN.stStructure.fVariable%/s%
      │    │       │          └─ Variable name
      │    │       └─ Structure name
      │    └─ Program name (MAIN)
      └─ PLC identifier
```

### Localization

**Adding Translations**:
1. Edit `HMI_Dark/Localization/en.localization`
2. Edit `HMI_Dark/Localization/de.localization`
3. Use in UI: `%l%MyTranslationKey%/l%`

---

## Common Tasks

### Task: Change Active Theme

**Edit**: `HMI_Dark/Properties/tchmiconfig.json`
```json
{
  "activeTheme": "Base-Dark",  // Change to "Base" for light theme
  "themes": {
    "Base-Dark": {},
    "Base": {}
  }
}
```

### Task: Change Default Resolution

**Edit**: `HMI_Dark/Properties/tchmiconfig.json`
```json
{
  "defaultView": {
    "resolution": {
      "width": 1920,   // Modify as needed
      "height": 1080
    }
  }
}
```

### Task: Add New Page

1. Create `Pages/MyPage.content`
2. Add to navigation in `Desktop.view`
3. Reference in routing configuration

### Task: Debug JavaScript Functions

```javascript
// Add console logging
console.log('Debug:', variableName);
console.error('Error occurred:', errorMessage);

// Use browser DevTools (F12)
// Set breakpoints in .js files
```

### Task: Modify Login Behavior

**Edit**: `HMI_Dark/Server/TcHmiUserManagement/TcHmiUserManagement.Config.default.json`

### Task: Change Startup Page

**Edit**: `HMI_Dark/Properties/tchmiconfig.json`
```json
{
  "startupView": {
    "name": "Desktop.view"  // Change to different view
  },
  "loginPage": "/Pages/LoginPage.html"
}
```

---

## Testing & Deployment

### Local Testing

1. **Build Project**: Use MSBuild or Visual Studio
2. **Start HMI Server**: TwinCAT HMI server runs automatically
3. **Open Browser**: Navigate to `http://localhost:PORT`
4. **Test Features**: Login and verify functionality

### Build Configurations

- **Debug**: Full debugging, verbose logging
- **Release**: Optimized, minified resources

### Deployment to HMI Panel

1. **Right-click project** → Publish
2. **Select target**: Remote HMI panel or local runtime
3. **Configure**: Edit `Properties/tchmipublish.config.json`
4. **Deploy**: Transfer and start application

### Archive Creation

The `.tnzip` file (`HMI_Dark.tnzip`) is a backup/distribution archive:
- Create: Right-click project → Create Archive
- Restore: Import .tnzip into TwinCAT XAE

---

## Important Notes for AI Assistants

### Language Considerations
- **Primary Language**: English (code and comments)
- **Secondary**: Portuguese (some page names, functions like `ImprimirValorControle`)
- **UI Languages**: English and German localization files
- **Be aware**: Mixed language naming in UI (e.g., `Configurações`, `Alarmes`)

### Critical Files - Handle with Care

| File | Importance | Notes |
|------|-----------|-------|
| `tchmiconfig.json` | ⭐⭐⭐ Critical | Main config - syntax errors break app |
| `HMI_Dark.hmiproj` | ⭐⭐⭐ Critical | Project file - MSBuild dependency |
| `*.Config.default.json` | ⭐⭐ Important | Server configs - validate JSON |
| `Desktop.view` | ⭐⭐ Important | Main layout - UI structure |
| Custom functions .js | ⭐⭐ Important | Business logic - test thoroughly |

### When Making Changes

1. **Always validate JSON**: Configuration files are strict JSON (no comments, trailing commas)
2. **Maintain namespace pattern**: All custom functions use TwinCAT HMI namespace
3. **Test PLC connectivity**: Symbol bindings require running PLC
4. **Preserve file pairing**: .js must have .function.json, .usercontrol must have .usercontrol.json
5. **Follow naming conventions**: SCU_ prefix for sensor control components
6. **Check theme compatibility**: Visual changes should work in both themes
7. **Verify localization**: UI text should have EN and DE translations

### Code Quality Guidelines

1. **Type Checking**: Validate parameter types in functions
2. **Error Handling**: Use try-catch for symbol operations
3. **Console Logging**: Use for debugging, remove for production
4. **Comments**: Document complex logic, especially PLC interactions
5. **Async Awareness**: Symbol reads/writes can be async

### TwinCAT HMI Specific

- **Symbol Format**: Always use `%s%SymbolName%/s%` for PLC variables
- **Control Access**: Use `TcHmi.Controls.get(id)` to manipulate controls
- **Framework APIs**: Prefix with `TcHmi.` (e.g., `TcHmi.Symbol`, `TcHmi.EventProvider`)
- **Registration Required**: All functions must call `registerFunctionEx`
- **Case Sensitive**: File paths and control IDs are case-sensitive

### Common Pitfalls to Avoid

1. ❌ **Don't break JSON syntax** in config files (most common error)
2. ❌ **Don't modify framework files** in `Packages/` directory
3. ❌ **Don't remove function registration** calls
4. ❌ **Don't hardcode PLC values** - use symbol bindings
5. ❌ **Don't forget null checks** when accessing controls
6. ❌ **Don't use ES6+ features** without TypeScript transpilation (target is ES2020)
7. ❌ **Don't modify .tnzip** file (it's a binary archive)

### Debugging Tips

```javascript
// Log all parameters
console.log('Function called:', arguments);

// Check symbol existence
var exists = TcHmi.Symbol.exists('%s%PLC1.MAIN.Variable%/s%');
console.log('Symbol exists:', exists);

// Monitor control state
var control = TcHmi.Controls.get('ControlId');
console.log('Control:', control ? control.getId() : 'not found');

// Check framework version
console.log('Framework version:', TcHmi.Version);
```

### Performance Considerations

- **Symbol Reads**: Can be slow over network - cache when possible
- **UI Updates**: Batch updates to avoid excessive redraws
- **Logging**: Excessive console.log impacts performance
- **Image Sizes**: 47 images - optimize if loading is slow

### Security Considerations

- **User Management**: Role-based access configured in `TcHmiUserManagement/`
- **Login Required**: Application requires authentication via LoginPage.html
- **Symbol Access**: Server enforces symbol access permissions
- **Input Validation**: Always validate user input before PLC writes

### Documentation Standards

When documenting changes:
- **Function Purpose**: Explain what and why, not just how
- **Parameter Descriptions**: Include types and valid ranges
- **Symbol Dependencies**: Document required PLC variables
- **UI Changes**: Note theme compatibility
- **Breaking Changes**: Clearly mark backward-incompatible changes

### Best Practices for AI Assistants

1. ✅ **Always read before writing**: Use Read tool before Edit/Write
2. ✅ **Preserve formatting**: Maintain indentation and style
3. ✅ **Validate JSON**: Check syntax after config changes
4. ✅ **Use parallel reads**: Read multiple files simultaneously when exploring
5. ✅ **Follow existing patterns**: Match the established code style
6. ✅ **Test incrementally**: Make small changes, verify, then continue
7. ✅ **Document assumptions**: Explain reasoning for architectural decisions
8. ✅ **Respect language mixing**: Preserve Portuguese names where used

---

## Quick Reference

### File Extensions Reference
- `.sln` - Visual Studio solution
- `.hmiproj` - TwinCAT HMI project file (MSBuild)
- `.js` - JavaScript function implementation
- `.function.json` - Function metadata
- `.usercontrol` - User control markup
- `.usercontrol.json` - User control configuration
- `.content` - Content page
- `.view` - View definition
- `.theme` - Theme definition
- `.localization` - Localization strings
- `.keyboard.json` - Virtual keyboard layout
- `.Config.default.json` - Default server configuration
- `.Config.remote.json` - Remote server configuration
- `.tnzip` - TwinCAT archive (backup)

### Useful Commands

```bash
# Build solution
msbuild HMI_Dark.sln /p:Configuration=Release

# Search for symbol usage
grep -r "PLC1.MAIN" HMI_Dark/

# Find all functions
ls -la HMI_Dark/Functions/*.js

# Validate JSON
cat HMI_Dark/Properties/tchmiconfig.json | python -m json.tool

# Check git status
git status

# View project structure
tree HMI_Dark -L 2
```

### Support Resources

- **TwinCAT HMI Documentation**: https://infosys.beckhoff.com
- **Beckhoff Support**: https://www.beckhoff.com/support
- **Framework Version**: 1.12.762.x
- **Project Type**: Industrial Automation HMI

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-15 | 1.0.0 | Initial CLAUDE.md creation - comprehensive project documentation |

---

## Contact & Support

**Project**: HMI-DARK_COMjs
**Company**: SIMEROS
**Framework**: Beckhoff TwinCAT HMI 1.12.762.x

For questions about this documentation or the codebase, refer to:
- TwinCAT HMI Infosys documentation
- Beckhoff support portal
- Project commit history for context

---

**Note**: This documentation is designed specifically for AI assistants working with this codebase. It prioritizes practical information about structure, patterns, and conventions to enable effective code understanding and modification.
