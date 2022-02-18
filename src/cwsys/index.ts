import { loggers } from '../logging'
import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'
import https from 'https'
import { json } from './data'
import path from 'path'

import express, { Request, Response } from 'express'
/**
 * Router Definition
 */
const logger = loggers.get('SYSTEM')

export const cwsysRouter = express.Router()

cwsysRouter.get('/', async (req: Request, res: Response) => {
  const arr = []
  const tmp = new Array(50).fill(0)
  let i = 1
  for (const t of tmp) {
    arr.push(path.join('/files/' + i.toString().padStart(2, '0') + '.xlsx'))
    i++
  }
  res.send(arr)
})

cwsysRouter.get('/run', async (req: Request, res: Response) => {
  try {
    const host = 'https://application.jcrc.go.jp'
    const ids: { id: number; token: string }[] = []
    logger.info('--------------Start Create Audit --------------')
    json.forEach(async (f) => {
      try {
        const {
          data: { accessToken },
        } = await axios.post(host + '/api/login', f)
        const {
          data: { id },
        } = await axios({
          method: 'POST',
          url: host + '/api/audits',
          headers: {
            Authorization: 'Bearer ' + accessToken,
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
          data: {
            audit_type_id: 1,
          },
        })
        ids.push({
          id,
          token: accessToken,
        })
        logger.info('Create Audit :', {
          id,
          token: accessToken,
        })
      } catch (error) {
        logger.error('Create Audit' + f.email + ' fail', (error as any).message)
      }
    })
    setTimeout(() => {
      console.log(ids.map((v) => v.id))
      logger.info('--------------Start Upload File--------------')
      ids.forEach(async (f) => {
        try {
          const form = new FormData()
          form.setMaxListeners(99)
          const tmp = new Array(50).fill(0)
          let i = 1
          for (const t of tmp) {
            form.append(
              'files',
              fs.createReadStream(
                path.join(
                  __dirname,
                  '/files/' + i.toString().padStart(2, '0') + '.xlsx'
                )
              )
            )
            i++
          }
          const { data: filesUploaded } = await axios({
            method: 'POST',
            url: host + '/api/upload?audit_id=' + f.id + '&multiple=true',
            headers: {
              Authorization: 'Bearer ' + f.token,
            },
            data: form,
          })
          logger.info('Uploaded :', filesUploaded)
        } catch (error) {
          console.log((error as any).message)
          logger.error('Uploaded file of' + f.id + ' fail', f)
        }
      })
    }, 1000 * 15)
    setTimeout(() => {
      let count = 0
      const max = 600
      const timer = setInterval(() => {
        if (count === max) {
          ids.forEach(async (f) => {
            try {
              logger.info('--------------Start Update Audit--------------')
              await axios.put(
                host + '/api/audit/' + f.id,
                {
                  statusText: 'next_uploaded',
                },
                {
                  headers: {
                    Authorization: 'Bearer ' + f.token,
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                  },
                }
              )
              logger.info('Audit updated :', f.id)
            } catch (error) {
              console.log(error)
            } finally {
              logger.info('--------------End Update--------------')
              clearInterval(timer)
            }
          })
        } else {
          logger.info('Run after ' + (max - count) + 's')
          count++
        }
      }, 1000)
    }, 1000 * 30)
    // const json = data
    //   .filter((f) => f.primary_user_email.match(/^sd00\+/g))
    //   .map((v) => v.id)
    // todo: CREATE PAYMENT -----------
    // const {
    //   data: { accessToken: token },
    // } = await axios.post(
    //   'https://knweb.0004s.com/api/login',
    //   {
    //     personalCode: 'ad00001',
    //     password: 'P@ssw0rd12345',
    //   },
    //   {
    //     auth: {
    //       username: '4s',
    //       password: '4s-mmsi4',
    //     },
    //     proxy: false,
    //     httpsAgent: new https.Agent({
    //       rejectUnauthorized: false,
    //     }),
    //   }
    // )
    // for (const entry_id of json) {
    //   try {
    //     const { data } = await axios({
    //       method: 'POST',
    //       url: 'https://knweb.0004s.com/api/applicants',
    //       headers: {
    //         Authorization: 'Bearer ' + token,
    //         accept: 'application/json',
    //         'Content-Type': 'application/json',
    //       },
    //       httpsAgent: new https.Agent({
    //         rejectUnauthorized: false,
    //       }),
    //       data: {
    //         entry_id,
    //       },
    //     })
    //     logger.info('Create GUnit with entry_id :', entry_id)
    //     rs.push(data)
    //   } catch (error) {
    //     continue
    //   }
    // }
    // todo: create audit
    // for (const audit of audits) {
    //   const form = new FormData()
    //   form.append(
    //     'files',
    //     fs.createReadStream(process.cwd() + '/src/cwsys/test.pdf')
    //   )
    //   const fileRes = await axios({
    //     method: 'POST',
    //     url:
    //       'https://knweb.0004s.com/api/upload?audit_id=' +
    //       audit.id +
    //       '&payment=true',
    //     headers: {
    //       ...form.getHeaders(),
    //       Authorization: 'Bearer ' + token,
    //     },
    //     httpsAgent: new https.Agent({
    //       rejectUnauthorized: false,
    //     }),
    //     data: form,
    //   })
    //   console.log(fileRes.data)
    //   const { data: payment } = await axios({
    //     method: 'POST',
    //     url: 'https://knweb.0004s.com/api/audit/' + audit.id + '/payments',
    //     headers: {
    //       Authorization: 'Bearer ' + token,
    //       accept: 'application/json',
    //       'Content-Type': 'application/json',
    //     },
    //     httpsAgent: new https.Agent({
    //       rejectUnauthorized: false,
    //     }),
    //     data: {
    //       fee: 1000 + Math.floor(Math.random() * 10) * 1000,
    //       statement_uri: fileRes.data[0],
    //     },
    //   })
    //   logger.info('Create Payment : OK-------', payment)
    //   rs.push(payment)
    // }
    // todo: ---------END------------

    // todo: CREATE AUDIT -----------
    // for (let i = 0; i < 500; i++) {
    //   const { data } = await axios.post(
    //     'https://application.0004s.com/api/audits',
    //     {
    //       audit_type_id: Math.ceil(Math.random() * 245),
    //     },
    //     {
    //       headers: {
    //         Authorization: 'Bearer ' + accessToken,
    //       },
    //     }
    //   )
    //   logger.info('Create : OK-------', data)
    //   logger.warn('Audit ID', data.id)
    //   rs.push(data)
    // }
    // todo: ---------END-----------

    res.status(200).send(ids)
  } catch (error) {
    console.log(error)
    res.status(500).send((error as any).message)
  }
})
