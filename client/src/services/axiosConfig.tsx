import axios from 'axios'

const nodeApi = axios.create({
  baseURL: 'http://localhost:3000'
});





export { nodeApi }