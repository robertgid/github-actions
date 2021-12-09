# image-name GitHub Action

## How the action works

Because github doesn't have a folder structure of the repositories, which would help us in generating and configuring repositries ( as we did in GitLab ), we have written an action that will generate the information ( from repository name ), which will be needed to create and publish docker images to the image registry.

```
Format of repository name: 
<group|namespace>-<image-name>

Examples: 
- Repository name: core-auth
  Group/Namespace: core
  Image-name: auth
  Registry path: core/auth

- Repository name: wallet-block-set
  Group/Namespace: wallet
  Image-name: block-set
  Registry path: wallet/block-set
```

## How to build and publish new versions

To build the action do the following commands
```bash
$ cd image-name
$ npm install
$ npm run all
```
After this is finshed commit all the changes done in `/dist` folder. This folder is used in the github actions.

## How to use the action

```yaml
- name: Populate metadata
  id: repo-meta
  uses: globalid/github-actions/image-name@v1
  with:
    runtime: node16
    docker: true
    dockerFile: DockerFile
- name: Get the output data
  run: |
    echo "The group was ${{ steps.repo-meta.outputs.group }}"
    echo "The name was ${{ steps.repo-meta.outputs.name }}"
    echo "The image-name was ${{ steps.repo-meta.outputs.image-name }}"
```

### Input
| Name | Type | Default | Description |
|------|------|---------|-------------|
| runtime(optional) | string | node16 | Which default docker image to use |
| docker(optional) | boolean | false | Should the action create DockerFile inside the repository |
| dockerFile(optional) | string | | Path to the custom DockerFile |