import { Component, computed, input } from '@angular/core';

/** Pretty-prints any value as JSON inside a &lt;pre&gt; block. */
@Component({
  selector: 'app-json-viewer',
  standalone: true,
  template: `<pre class="json">{{ text() }}</pre>`,
})
export class JsonViewer {
  readonly value = input<unknown>(null);
  protected readonly text = computed(() => {
    const v = this.value();
    return v === null || v === undefined ? '' : JSON.stringify(v, null, 2);
  });
}
