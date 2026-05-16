import { Component } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-markdown',
  standalone: true,
  imports: [MarkdownComponent],
  templateUrl: './markdown-view.component.html',
  styleUrl: './markdown-view.component.scss'
})
export class MarkdownViewComponent {
  markdownContent = `
# H1: Corporate Overview (heading[depth=1])
This is a paragraph (paragraph) with **Strong Text** (strong) and *Emphasized Text* (emphasis).

## H2: Key Statistics (heading[depth=2])
---
(thematicBreak)

### H3: Order Logistics (heading[depth=3])

blah blah blah 

> "Business data should be accessible and clean." (blockquote)

blah blah blah 
blah blah

blah blah blah blah

*   Unordered Item 1 (listItem)
*   Unordered Item 2
    *   Nested spread list (list[spread=true])

1.  Ordered Step 1 (list[ordered=true])
2.  Ordered Step 2

#### H4: Product Inventory (heading[depth=4])

| ID | Product | Status |
|:---|:---:|---:|
| 101 | Widgets | [In Stock](https://example.com) |
| 102 | Gadgets | ~~Discontinued~~ |

##### H5: Technical Details (heading[depth=5])
Use \`npm install better-sqlite3\` (inlineCode) to connect.

\`\`\`javascript
// Code Block (code[lang="js"])
const db = require('better-sqlite3')('northwind.db');
const row = db.prepare('SELECT * FROM Customers').get();
console.log(row);
\`\`\`

\`\`\`ts
export interface TestMarkdown {
  doesItWork?: boolean;
  nameMe: string;
}
\`\`\`

\`\`\`csharp
public class MyClass{
  public static string name = "Hey Buddy";
}
\`\`\`

\`\`\`sql
SELECT TOP 10 * FROM CodeHighlights
\`\`\`

###### H6: Internal Metadata (heading[depth=6])
![Business Logo](https://via.placeholder.com/150 "Logo Title") (image[title])

<html>
  <div class="alert alert-info">Raw HTML Segment</div>
</html>
`;
  
}
