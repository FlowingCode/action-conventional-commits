import {validateCommitMessage, getSemverLevel} from "../isValidCommitMesage";

test("should be able to correctly validate the commit message", () => {
    
    expect(validateCommitMessage("chore(nice-one): doing this right")).toBeNull();
    expect(validateCommitMessage("feat!: change all the things")).toBeNull();
    expect(validateCommitMessage("fix(user)!: a fix with some breaking changes")).toBeNull();
    expect(validateCommitMessage("fix: menu must open on shortcut press")).toBeNull();
    expect(validateCommitMessage("something: should not work")).toBeTruthy();
    expect(validateCommitMessage("fixes something")).toBeTruthy();
    expect(validateCommitMessage("🚧 fix: menu must open on shortcut press")).toBeTruthy();
    expect(validateCommitMessage("fix(menus): menu must open on shortcut press")).toBeNull();
    expect(validateCommitMessage("🚧 fix(menus): menu must open on shortcut press")).toBeTruthy();
    expect(validateCommitMessage("🚧 fixing something")).toBeTruthy();
    expect(validateCommitMessage("🚧 something: should not work")).toBeTruthy();
    expect(validateCommitMessage("chorz: 123")).toBeTruthy();

    expect(validateCommitMessage("fix: it")).toBeNull();
    expect(validateCommitMessage("fix")).toBeTruthy();
    expect(validateCommitMessage("fix it")).toBeTruthy();
    expect(validateCommitMessage("fix:")).toBeTruthy();
    expect(validateCommitMessage("fix:it")).toBeTruthy();
    
    expect(validateCommitMessage("ci!: change of type ci must not be breaking")).toBeTruthy();
    expect(validateCommitMessage("style!: change of type style must not be breaking")).toBeTruthy();
    expect(validateCommitMessage("test!: change of type test must not be breaking")).toBeTruthy();
    expect(validateCommitMessage("docs!: change of type docs must not be breaking")).toBeTruthy();
    expect(validateCommitMessage("deprecate!: change of type deprecate must not be breaking")).toBeTruthy();
    
    expect(validateCommitMessage("remove: change of type remove must be breaking")).toBeTruthy();
    
    expect(validateCommitMessage("fix: length is 71 90123456789012345678901234567890123456789012345678901")).toBeNull();
    expect(validateCommitMessage("fix: length is 72 901234567890123456789012345678901234567890123456789012")).toBeTruthy();
    
    expect(validateCommitMessage("revert: fix: must begin with the type of the reverted commit")).toBeNull();
    expect(validateCommitMessage("revert: must begin with the type of the reverted commit")).toBeTruthy();
    
    expect(validateCommitMessage("fix: commit type must be lowercase")).toBeNull();
    expect(validateCommitMessage("FIX: commit type must be uppercase")).toBeTruthy();
    expect(validateCommitMessage("Fix: commit type must be uppercase")).toBeTruthy();

    expect(validateCommitMessage("fix: Commit subject must start with lowercase")).toBeTruthy();
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
