import axios from '@/plugins/axios'

const URI = '/user'

export function login(req) {
  return axios.post(`/login`, req)
}

export function register(req) {
  return axios.post(`/register`, req)
}

export function googleAuth(token) {
  return axios.post(`/google/login`, token)
}

export function updateUser(account) {
  return axios.put(`${URI}`, account)
}

export function updateUserInvitation(allow) {
  return axios.put(`${URI}/invite`, null, {
    params: { allow }
  })
}
