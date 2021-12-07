# image-name GitHub Action

## How the NPM-Version action works

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

### Variables

* runtime(optional): Which default docker image to use ( default: node16 )
* docker(optional): Should the action create DockerFile inside the repository ( default: false )
* dockerFile(optional): Path to the custom DockerFile