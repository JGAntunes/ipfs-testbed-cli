'use strict'

const k8s = require('@kubernetes/client-node')

const config = require('../config').kubernetes

const kc = new k8s.KubeConfig()
kc.loadFromDefault()

const k8sApiCore = kc.makeApiClient(k8s.Core_v1Api)
const k8sApiApps = kc.makeApiClient(k8s.Apps_v1Api)
const k8sExtensions = kc.makeApiClient(k8s.Extensions_v1beta1Api)

function handleErrorCode (res) {
  const statusCode = res.response.statusCode
  if (statusCode >= 400) {
    throw new Error(`Got ${statusCode} from k8s client - ${JSON.stringify(res.body, null, 2)}`)
  }
}

async function getNodes () {
  const res = await k8sApiCore.listNode()
  handleErrorCode(res)
  return res.body
}

async function getServices ({ namespace, labelSelector }) {
  const res = await k8sApiCore.listNamespacedService(namespace, null, null, null, null, labelSelector)
  handleErrorCode(res)
  return res.body
}

async function getIngresses ({ namespace, labelSelector }) {
  const res = await k8sExtensions.listNamespacedIngress(namespace, null, null, null, null, labelSelector)
  handleErrorCode(res)
  return res.body
}

async function getDeployments ({ namespace, labelSelector }) {
  const res = await k8sApiApps.listNamespacedDeployment(namespace, null, null, null, null, labelSelector)
  handleErrorCode(res)
  return res.body
}

async function getNodeInfo ({ namespace = 'ipfs-testbed', labelSelector = 'app.kubernetes.io/name=ipfs-testbed', id, peerId } = {}) {
  if (peerId) labelSelector = `${labelSelector},ipfs-testbed/ipfs-id=${peerId}`
  if (id) labelSelector = `${labelSelector},app.kubernetes.io/instance=${id}`
  const [nodes, servicesReply, ingressesReply] = await Promise.all([
    getNodes(),
    getServices({ namespace, labelSelector }),
    getIngresses({ namespace, labelSelector }),
    getDeployments({ namespace, labelSelector })
  ])

  const services = servicesReply.items
  const ingresses = ingressesReply.items

  const k8sInfo = {}
  services.forEach(service => {
    k8sInfo[service.metadata.name] = { service, ...k8sInfo[service.metadata.name] }
  })
  ingresses.forEach(ingress => {
    k8sInfo[ingress.metadata.name] = { ingress, ...k8sInfo[ingress.metadata.name] }
  })

  return Object.values(k8sInfo).map(({ ingress, service }) => {
    const ipfsAPI = {}
    const toxiproxyAPI = {}
    // Do we have ingresses
    if (ingress) {
      ipfsAPI.host = ingress.spec.rules.find(rule => rule.http.paths[0].backend.servicePort === config.ipfsPortName).host
      // IPFS http api client sets a default port...
      ipfsAPI.port = 80
      toxiproxyAPI.host = ingress.spec.rules.find(rule => rule.http.paths[0].backend.servicePort === config.toxiproxyPortName).host
      // We're using NodePort services
    } else {
      // TODO Using the first node for now
      const addresses = nodes.items[0].status.addresses
      // Look for an ExternalIP, else look for a Hostname, else look for an InternalIP
      let ad = addresses.find((address) => address.type === 'ExternalIP')
      if (!ad) ad = addresses.find((address) => address.type === 'Hostname')
      if (!ad) ad = addresses.find((address) => address.type === 'InternalIP')
      toxiproxyAPI.host = ipfsAPI.host = ad.address

      // Get ports for each service
      ipfsAPI.port = service.spec.ports.find(port => port.name === config.ipfsPortName).nodePort
      toxiproxyAPI.port = service.spec.ports.find(port => port.name === config.toxiproxyPortName).nodePort
    }
    return {
      // node-{number}
      id: service.metadata.labels['app.kubernetes.io/instance'],
      // The IPFS id
      peerId: service.metadata.labels['ipfs-testbed/ipfs-id'],
      // node-{number}-ipfs-testbed
      name: service.metadata.name,
      hosts: {
        ipfsAPI,
        toxiproxyAPI
      }
    }
  })
}

module.exports = {
  getNodeInfo
}
