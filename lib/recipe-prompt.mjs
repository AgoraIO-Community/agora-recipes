/**
 * @param {{ title: string, recipeUrl?: string, mainRepoUrl?: string, setup?: { directory: string, testRequest: string } }} meta
 * @param {{ rawUrl: string }} document
 * @param {string} slug
 */
export function buildRecipePrompt(meta, document, slug) {
  if (!meta.recipeUrl) return ""
  if (meta.setup) return `Help me create and run the ${meta.title} using Agora CLI.

Check that Agora CLI is installed and ready. If installation or an upgrade is needed, ask before proceeding. Guide me through browser login when required.

Get the recipe details:
agora recipes show ${slug} --json

Read its implementation guide:
${document.rawUrl}

Reference source:
${meta.mainRepoUrl}

Before initialization, confirm which Agora project to use. Ask before creating a new Agora project.

Initialize the app in a new or empty directory. Replace <confirmed-project-id> with the actual ID of the project confirmed above before running:
agora init ${meta.setup.directory} --recipe ${slug} --project <confirmed-project-id> --json

Let the CLI configure the credentials. Never print the App Certificate in chat or expose it in browser code.

Follow the returned nextSteps to install dependencies and start the app. Help diagnose and resolve any errors.

Provide the local URL and guide me through microphone access. Help me test this request:
"${meta.setup.testRequest}"

Report what was verified and what still needs testing. Follow the capabilities and limits in the implementation guide; do not claim external actions were completed without verification.`

  return `You are implementing the "${meta.title}" recipe in this project.

Read the recipe markdown first:
${document.rawUrl}

Use the source repository for cross-reference:
${meta.mainRepoUrl}

Build this recipe into the user's app using the markdown as the implementation guide. Inspect related source files through the repository links when the recipe points to them. Ask before installing new dependencies.`
}
