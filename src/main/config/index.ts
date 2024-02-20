export const cookie =
  'a1=18d2ecce5c1np6m6lz496r8yn9fps9xmf063r74va30000211324; webId=ac0b02d5745b1859956abb14b5777ca6; gid=yYfJdSSdijiDyYfJdSSd28W4SyIUK6K1u4jKKh0FYvIjiqq8UMjC6F888JyyqJ48DqJj4jjJ; abRequestId=ac0b02d5745b1859956abb14b5777ca6; webBuild=4.0.5; cache_feeds=[]; unread={%22ub%22:%226569e2dc0000000038030419%22%2C%22ue%22:%2265816ee2000000001502f14e%22%2C%22uc%22:5}; galaxy_creator_session_id=XM90CiXb5kg4ggBkY5FcTftwtMuGkAwWquvW; galaxy.creator.beaker.session.id=1705887444842022806746; websectiga=9730ffafd96f2d09dc024760e253af6ab1feb0002827740b95a255ddf6847fc8; sec_poison_id=6f4a09df-0743-4ce9-80bc-6ffbdd0c7539; xsecappid=xhs-pc-web'
export const creator_cookie =
  'a1=18d2ecce5c1np6m6lz496r8yn9fps9xmf063r74va30000211324; webId=ac0b02d5745b1859956abb14b5777ca6; gid=yYfJdSSdijiDyYfJdSSd28W4SyIUK6K1u4jKKh0FYvIjiqq8UMjC6F888JyyqJ48DqJj4jjJ; abRequestId=ac0b02d5745b1859956abb14b5777ca6; webBuild=4.0.5; web_session=040069b0aa235212cebf7c8e98374b0f3476cf; unread={%22ub%22:%226569e2dc0000000038030419%22%2C%22ue%22:%2265816ee2000000001502f14e%22%2C%22uc%22:5}; customerClientId=997214191076115; customer-sso-sid=65adc6d3f600000000000012; x-user-id-creator.xiaohongshu.com=61de601a0000000010009ee9; access-token-creator.xiaohongshu.com=customer.ares.AT-6d5e61764aaf4f5f8ea3fcfd6fac2569-c4d0f36c28f4448daaab8ba6cd720232; galaxy_creator_session_id=XM90CiXb5kg4ggBkY5FcTftwtMuGkAwWquvW; galaxy.creator.beaker.session.id=1705887444842022806746; fecreatorcreator-status=online; fecreatorcreator-status.sig=hONhqbf1FgWDB6m1qqUw2kUCTR7Q965C9_7OPE7Hp7w; feugc-status=gray; feugc-status.sig=jAzJM8IrdI8cDODliRVhchWqdncRdRAEfSOxghp98Zo; fecreatormcn-status=online; fecreatormcn-status.sig=_5m-gktr7CfMaqFQDhsy2ihjqXHQuVjb0DZg10KGgoU; xsecappid=ugc; websectiga=9730ffafd96f2d09dc024760e253af6ab1feb0002827740b95a255ddf6847fc8; sec_poison_id=6f4a09df-0743-4ce9-80bc-6ffbdd0c7539'
export const headers = {
  userAgent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

export const creator_cookie_names = [
  'fecreatorcreator-status',
  'fecreatorcreator-status.sig',
  'fecreatormcn-status',
  'fecreatormcn-status.sig',
  'feugc-status.sig',
  'feugc-status'
]

let userCustomChromePath = ''

export const setUserCustomChromePath = (newPath: string) => {
  userCustomChromePath = newPath || ''
  return getDefaultOsPath()
}

export const getDefaultOsPath = () => {
  if (userCustomChromePath) {
    return userCustomChromePath
  }
  if (process.platform === 'win32') {
    return 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  } else {
    return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  }
}
