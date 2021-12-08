import * as github from '@actions/github'
import * as core from '@actions/core'
import * as io from '@actions/io'
import * as path from 'path'

const logger = console

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
  logger.log(`temp file: ${tempFile}`)
  logger.log(`setting runtime for: ${runtime}`)

  await io.cp(`${__dirname}/docker/${runtime}`, tempFile).catch(e => {
    logger.log(e)
  })

  return tempFile
}

async function run(): Promise<void> {
  try {
    const runtime = core.getInput('runtime')
    const docker = core.getInput('docker')
    const customDockerFile = core.getInput('dockerFile')
    logger.log(`inputs runtime: ${runtime}, docker: ${docker}, custom docker file: ${customDockerFile}`)

    if (github.context.payload.repository === undefined) {
      throw new Error('repository missing in the payload')
    }
    const repoName = github.context.payload.repository.name
    const ref = github.context.ref
    logger.log(`The repo: ${repoName}`)
    logger.log(`Ref: ${ref}`)

    const idx = repoName.indexOf('-')
    const group = repoName.substr(0, idx)
    const imageName = repoName.substr(idx + 1)
    const fullImageName = `${group}/${imageName}`
    const shortRef = ref.substring(ref.lastIndexOf('/') + 1)

    logger.log(`Ref: ${ref}, short ref: ${shortRef}`)
    const imageTag = ref.startsWith('refs/tags') ? shortRef : github.context.sha
    logger.log(`Group: ${group}`)
    logger.log(`Image name: ${imageName}`)
    logger.log(`full image name: ${fullImageName}`)
    logger.log(`namespace: ${group}`)

    core.setOutput('group', group)
    core.setOutput('name', imageName)
    core.setOutput('image-name', fullImageName)
    core.setOutput('image-tag', imageTag)
    core.setOutput('namespace', group)

    if (docker) {
      let dockerFile
      if (typeof customDockerFile != 'undefined' && customDockerFile !== '') {
        logger.log(`using user provided docker file: ${customDockerFile}`)
        dockerFile = customDockerFile
      } else {
        dockerFile = await copyDockerFile(runtime)
      }
      logger.log(`Docker file: ${dockerFile}`)
      core.setOutput('docker-file', dockerFile)
    }
  } catch (error) {
    core.setFailed((<Error>error).message)
  }
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
