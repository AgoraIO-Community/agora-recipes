# Agora Glass surface

Source: [`shczhen/agent-ui`](https://github.com/shczhen/agent-ui/tree/9ca9d39be0037adf34a8984b1ab3a8383df0477c), supplied by the user through `agora-family-standalone.html`.

`GlassSurface` retains the original measured refraction map, RGB displacement,
independent foreground, and resize handling. The source material CSS is narrowed
to the search surface, selected filters, and sorting controls. Pointer-following
light and ambient animation are omitted. Other fonts and global color tokens
continue to come from the Agora Website family.

The host fixes `data-theme="dark"` and uses only the dark palette. Chromium uses SVG backdrop
refraction; WebKit uses the frosted path. Reduced transparency, forced colors,
and unsupported backdrop filtering keep solid, readable surfaces. Input text
and interactive controls stay outside the filtered backdrop.
