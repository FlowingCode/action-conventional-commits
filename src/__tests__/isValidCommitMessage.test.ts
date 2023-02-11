import {isValidCommitMessage, getSemverLevel} from "../isValidCommitMesage";

test("should be able to correctly validate the commit message", () => {
    expect(isValidCommitMessage("chore(nice-one): doing this right")).toBe(true);
    expect(isValidCommitMessage("feat!: change all the things")).toBe(true);
    expect(isValidCommitMessage("fix(user)!: a fix with some breaking changes")).toBe(true);
    expect(isValidCommitMessage("fix: menu must open on shortcut press")).toBe(true);
    expect(isValidCommitMessage("something: should not work")).toBe(false);
    expect(isValidCommitMessage("fixes something")).toBe(false);
    expect(isValidCommitMessage("🚧 fix: menu must open on shortcut press")).toBe(true);
    expect(isValidCommitMessage("fix(menus): menu must open on shortcut press")).toBe(true);
    expect(isValidCommitMessage("🚧 fix(menus): menu must open on shortcut press")).toBe(true);
    expect(isValidCommitMessage("🚧 fixing something")).toBe(false);
    expect(isValidCommitMessage("🚧 something: should not work")).toBe(false);
    expect(isValidCommitMessage("chorz: 123")).toBe(false);
});


test("should be able to correctly parse the semver level", () => {
    expect(getSemverLevel("revert: fix: foo")).toBe(0);
    expect(getSemverLevel("style: foo")).toBe(0);
    expect(getSemverLevel("ci: foo")).toBe(0);
    expect(getSemverLevel("test: foo")).toBe(0);
    expect(getSemverLevel("fix: foo")).toBe(1);
    expect(getSemverLevel("feat: foo")).toBe(2);
    expect(getSemverLevel("deprecate: foo")).toBe(2);
    expect(getSemverLevel("feat!: foo")).toBe(3);
    expect(getSemverLevel("fix!: foo")).toBe(3);
});
