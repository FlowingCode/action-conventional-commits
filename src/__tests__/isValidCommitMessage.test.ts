import {validateCommitMessage, getSemverLevel} from "../isValidCommitMesage";

test("should be able to correctly validate the commit message", () => {
    
    expect(validateCommitMessage("chore(nice-one): doing this right")).toBeNull();
    expect(validateCommitMessage("feat!: change all the things")).toBeNull();
    expect(validateCommitMessage("fix(user)!: a fix with some breaking changes")).toBeNull();
    expect(validateCommitMessage("fix: menu must open on shortcut press")).toBeNull();
    expect(validateCommitMessage("something: should not work")).toBeTruthy();
    expect(validateCommitMessage("fixes something")).toBeTruthy();
    expect(validateCommitMessage("🚧 fix: menu must open on shortcut press")).toBeNull();
    expect(validateCommitMessage("fix(menus): menu must open on shortcut press")).toBeNull();
    expect(validateCommitMessage("🚧 fix(menus): menu must open on shortcut press")).toBeNull();
    expect(validateCommitMessage("🚧 fixing something")).toBeTruthy();
    expect(validateCommitMessage("🚧 something: should not work")).toBeTruthy();
    expect(validateCommitMessage("chorz: 123")).toBeTruthy();
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
