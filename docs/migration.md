# Preserve the original data

The original project and its browser storage are left untouched. `localhost:5173`, `localhost:5174` and the published site are separate origins with separate data. A new implementation cannot read another origin's localStorage.

The new app accepts its own backup format or an object containing the original six keys. If the original app has no export screen, the owner can run the following **read-only export** in the browser console while on the original website. It reads only the six named Nourish keys, downloads JSON locally and does not delete or change anything:

```js
const keys = [
  'nourish-profile',
  'nourish-diary',
  'nourish-weights',
  'nourish-foods',
  'nourish-meal-templates',
  'nourish-activities',
];
const backup = Object.fromEntries(
  keys.map((key) => [key, JSON.parse(localStorage.getItem(key) || 'null')]),
);
const link = document.createElement('a');
link.href = URL.createObjectURL(
  new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
);
link.download = 'original-nourish-backup.json';
link.click();
setTimeout(() => URL.revokeObjectURL(link.href), 1000);
```

In the NEW app: profile → Appearance & data → Import backup. Review counts before confirming replacement. Export each original origin separately if you used both the local preview and published site. Do not share the JSON publicly: it contains your personal nutrition/weight data. Legacy entries without historical goals remain unknown rather than being assigned today's goal.
