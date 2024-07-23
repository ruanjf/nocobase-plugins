const typeMap = {
  'LONG': 'number',
  'STRING': 'string',
}

function apiToType(res) {
  const reqBody = res.data.params.filter(a => a.position === 'BODY').map(a => {
    return {
      name: a.name,
      desc: a.desc?.replaceAll('\n', ' ') || '',
      required: a.required,
      type: typeMap[a.type] || 'any',
    }
  })
  const resBody = res.data.rspParams.map(a => {
    return {
      name: a.name,
      desc: a.desc?.replaceAll('\n', ' ') || '',
      required: a.required,
      type: typeMap[a.type] || 'any',
    }
  })

  const type = `
  export type Req = {
${reqBody.map(a => `    /** ${a.desc} */\n    ${a.name}${a.required ? '' : '?'}: ${a.type};`).join('\n')}
  }
  export type Res = {
${resBody.map(a => `    /** ${a.desc} */\n    ${a.name}${a.required ? '' : '?'}: ${a.type};`).join('\n')}
  }
  async userAccessToken(taskId: number, projectId?: number) {
    return api.doRequest<null>('POST', \`{baseUrl}/v1.0/oauth2/userAccessToken\`, null, {
      clientId: this.#appKey,
      clientSecret: this.#appSecret,
    });
  },
`;
  // console.log(type)
  return type
}

async function genApiDetail(uuid, devType = 'org') {
  const fd = new FormData();
  fd.append('uuid', uuid);
  fd.append('devType', devType)
  const res = await fetch('https://open-dev.dingtalk.com/openapi/explorer/getApiDetail', {
    "headers": {
    },
    "body": fd,
    "method": "POST"
  });
  const data = await res.json();
  // console.log(data);
  return data;
}


(async() => {
  // const res = await genApiDetail('oauth2_1.0#GetUserToken')
  // const res = await genApiDetail('contact_1.0#GetUser')
  const res = await genApiDetail('dingtalk.oapi.v2.user.get')
  console.log(apiToType(res));
})()
