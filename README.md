# Fleeting Notes Plugin

Documentation to Create Your Own Plugin:
https://www.fleetingnotes.app/docs/plugins/create-your-own-plugin

## Local webserver setup

1. Install [deno](https://deno.com/manual@v1.33.4/getting_started/installation)
2. Add `.env` file
3. Run script to generate manifest

```
deno run --allow-read --allow-write routes-manifest-generate.ts
```

4. Start webserver

```
deno run --allow-all webserver.ts
```

## Testing Documentation

To write and run tests for the project, follow these steps:

### Writing Tests

1. Create a folder named `__test__` in the project's root directory.
2. Inside the `__test__` folder, create a new test file with the .test.ts
   extension.
3. Write test cases using a testing framework like Deno's built-in testing
   framework

Example:

```
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.192.0/testing/bdd.ts";

description("Math operations", () => {
  it("should add two numbers correctly", () => {
    const result = 1 + 2;
    assertEquals(result, 3);
  });
});
```

### Running Tests

```
deno test --allow-all
```
