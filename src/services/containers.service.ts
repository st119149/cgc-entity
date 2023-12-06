import {FileContainer} from "../types";
import {client, clientSMC, contentClient} from "../http";
import axios, {AxiosRequestConfig} from "axios";
import {AUTH_STORAGE_KEY, AuthData} from "../store/slices/authSlice";

export class ContainersService {

  static fetchContainers = () => {
    return contentClient.get<{ containers: FileContainer[] }>('/containers')
      .then(resp => resp.data.containers)
  }

  static downloadYAML = (rows: Record<number, number[]> = {}) => {
    return client.post<Blob>(`/download`, rows, {responseType: 'stream'})
      .then(resp => {
        return ({
          data: resp.data,
          filename: resp.headers["content-disposition"]?.match('filename[^;=\\n]*=(([\'"]).*?\\2|[^;\\n]*)')[1] as string ?? 'entities.yaml'
        })
      })
  }

  static uploadFile = (formData: FormData, config: AxiosRequestConfig = {}) => {
    return client.post<{ recomendation: string, message: string, example: string }>(`/uploadfile`, formData, config)
  }

  static removeFile = (id: number) => {
    return client.delete<void>(`/container/${id}`)
  }

  static fetchYAML = (rows: Record<number, number[]> | null = null) => {
    return client.post<string>(`/download/text`, rows)
      .then(resp => resp.data)
  }

  static validateYAML = (content: string) => {
    return clientSMC.post<{ message: string }>(
      `/svc/mdc/yaml/validate`,
      content, {
        headers: {
          "Content-Type": 'text/plain'
        }
      })
      .then(resp => resp.data)
  }

  static downloadTemplate = () => {
    return client.get<Blob>(`/download/template`, {responseType: 'blob'})
      .then(resp => {
        return ({
          data: resp.data,
          filename: resp.headers["content-disposition"]?.match('filename[^;=\\n]*=(([\'"]).*?\\2|[^;\\n]*)')[1] as string ?? 'template.xlsx'
        })
      })
  }
}