import * as core from '@actions/core'
import * as io from '@actions/io'
import * as path from 'path'

function getDockerFilePath(): string {
  const tempDirectory = process.env.RUNNER_TEMP
  if (tempDirectory !== undefined) {
    return path.join(tempDirectory, `dockerfile-${new Date().getTime().toString()}`)
  } else {
    throw new Error('Unable to create temp directory.')
  }
}

async function copyDockerFile(runtime: string): Promise<string> {
  const tempFile = getDockerFilePath()
  core.notice(`temp file: ${tempFile}`)
  core.notice(`setting runtime for: ${runtime}`)

  await io.cp(`${__dirname}/docker/${runtime}`, tempFile).catch((e: Error) => {
    core.error(e)
  })

  return tempFile
}

async function run(): Promise<void> {
  try {
    const runtime = core.getInput('runtime')
    const customDockerFile = core.getInput('dockerFile')
    core.notice(`inputs runtime: ${runtime}, custom docker file: ${customDockerFile}`)

    let dockerFile
    if (typeof customDockerFile != 'undefined' && customDockerFile !== '') {
      core.notice(`using user provided docker file: ${customDockerFile}`)
      dockerFile = customDockerFile
    } else {
      dockerFile = await copyDockerFile(runtime)
    }
    core.notice(`Docker file: ${dockerFile}`)
    core.setOutput('docker-file', dockerFile)
  } catch (error) {
    core.setFailed((<Error>error).message)
  }
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
