## To run your tests

`npm run test` or `npx cucumber-js` runs all tests
`npm run test <feature name>` or `npx cucumber-js <feature name>` run the single feature

## Browser selection

By default we will use chromium. You can define an envrionment variable called BROWSER and
set the name of the browser. Available options: chromium, firefox, webkit

On Linux and Mac you can write:

`BROWSER=firefox npm run test` or `BROWSER=firefox npx cucumber-js` runs all tests using Firefox

One Windows you need to write

```
set BROWSER=firefox
npm run test
```

## Debugging Features

### From CLI

- `npm run debug` - headful mode with APIs enables both APIs and debug options
- `npm run api` - headless mode with debug apis
- `npm run video` - headless mode vith video

## In Visual Studio Code

- Open the feature
- Select the debug options in the VSCode debugger
- Set breakpoints in the code

To stop the feature, you can add the `Then debug` step inside your feature. It will stop your debugger.

## To choose a reporter

The last reporter/formatter found on the cucumber-js command-line wins:

```text
--format summary --format @cucumber/pretty-formatter --format cucumber-console-formatter
```

In [cucumber.js](cucumber.js) file, modify the options.

## To ignore a scenario
- tag the scenario with `@ignore`

## To check for typescript, linting and gherkin errors
- run the command `npm run build`.

## To view the steps usage
- run the command `npm run steps-usage`.

## To view the html report of the last run
- run the command `npm run report`.

## To execute single tag
- run the command `npm run tag --tags="@test001"`.
 
## To execute multiple tag
- run the command `npm run tag --tags="@tag1 or @tag2"`.
