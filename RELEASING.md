# Releasing FL Plates

This checklist is the repeatable release flow for `FL Plates`.

## Standard Flow

1. Finish work on your feature branch.

```powershell
git checkout v1.2-work
git status
```

2. Build and test locally.

```powershell
npm run build
```

3. Commit the branch if needed.

```powershell
git add -A
git commit -m "Release FL Plates v1.2.0"
```

4. Push the branch.

```powershell
git push -u origin v1.2-work
```

5. Merge into `master`.

```powershell
git checkout master
git pull origin master
git merge --no-ff v1.2-work
```

6. Bump the version in `package.json` if you have not already.

Example:
- `1.1.0` -> `1.2.0`

Then rebuild so generated build info updates:

```powershell
npm run build
git add -A
git commit -m "Bump version to v1.2.0"
```

7. Push `master`.

```powershell
git push origin master
```

8. Create and push the tag.

```powershell
git tag -a v1.2.0 -m "FL Plates v1.2.0"
git push origin v1.2.0
```

9. Create the GitHub release.

```powershell
gh release create v1.2.0 --title "FL Plates v1.2.0" --notes "Release notes here"
```

10. Verify GitHub Pages or workflows if needed.

```powershell
gh run list --limit 5
```

## Release Notes Template

```text
FL Plates v1.2.0

Highlights:
- item 1
- item 2
- item 3
```

## Good Habits

- Keep `master` as the stable branch.
- Do new work on a branch like `v1.2-work`.
- Update `package.json` before the final release build.
- Tag only after `master` contains exactly what you want released.

## Shortcut Flow

If everything is already finished and tested:

```powershell
git checkout master
git merge --no-ff v1.2-work
npm run build
git add -A
git commit -m "Release FL Plates v1.2.0"
git push origin master
git tag -a v1.2.0 -m "FL Plates v1.2.0"
git push origin v1.2.0
gh release create v1.2.0 --title "FL Plates v1.2.0" --notes "Release notes here"
```
