# Angular Coding Standards

## Angular Template Syntax [HIGH PRIORITY]: Use `@` Control Flow Directives

ALWAYS prefer the modern Angular control flow directives (`@if`, `@for`, `@switch`, etc.) over legacy structural directives (`*ngIf`, `*ngFor`, etc.). Do not write new code using legacy star directives.

- **Conditionals & Aliasing:** Use the `as` syntax for cleaner templates when reading signals: `@if (dataSig(); as data) { {{ data.name }} }`.
- **Loops:** Always use `track` within `@for` (e.g., `@for (item of itemsSig(); track item.id)`).

## State Management and Data Flow [HIGH PRIORITY]: RxJS to Signals

The architecture relies strictly on a reactive, unidirectional data flow utilizing RxJS for all data manipulation and Angular Signals strictly for template binding.

**Core Rules:**
1. **NEVER DIRECTLY SUBSCRIBE TO AN OBSERVABLE** in component code. 
2. **Data Manipulation:** All data transformation and combining must happen within the RxJS observable stream using pipe operators (`map`, `filter`, `switchMap`, `combineLatest`, etc.).
3. **Signal Conversion:** Convert the final observable stream to a Signal using `toSignal()` (from `@angular/core/rxjs-interop`) for template rendering. Delay subscriptions to the last possible moment by using `toSignal()`.
4. **Naming Convention:** All signal variables must end with the suffix `Sig` (e.g., `sessionsSig`, `expiresInSig`).
5. **No Manual Signals:** Never create a new signal object manually (e.g., avoid `signal()` or `computed()` for remote/service data). Always derive UI signals from observables using `toSignal()`.
6. **No Effects:** NEVER use `effect()`. All side-effects and data transformations must be handled within the RxJS stream. Signals are exclusively for passing data to the HTML templates and managing the lifecycle of the underlying observable subscription automatically.
7. **No Constructors or Lifecycle Hooks:** Avoid using constructors or Angular lifecycle hooks (like `ngOnInit`, `ngOnChanges`, `ngOnDestroy`). If observables are well-constructed using `inject()` for dependencies and reactive operators for data flows, lifecycle hooks are completely unnecessary.
8. **One-off Actions (The Exception):** If you are forced to use a manual subscription to trigger a side-effect or functionality in an external package (e.g., a button click initiating a login flow or forcing a token refresh), you MUST limit it to a single emission using `.pipe(take(1)).subscribe()`. This prevents memory leaks and hanging subscriptions.

**Example Pattern:**
```typescript
// ✅ DO THIS:
private api = inject(ApiService);
private dataStream$ = this.api.getData().pipe(map(data => process(data)));
public myDataSig = toSignal(this.dataStream$); // Template binds to myDataSig()

// ❌ DO NOT DO THIS:
public myData: any;
constructor(private api: ApiService) {} // No constructors!
ngOnInit() { // No lifecycle hooks!
  this.api.getData().subscribe(data => { this.myData = data; }); // Manual subscription!
}
```