/*
Copyright (c) 2021 Michael Leggett, simpl.fyi
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice, attribution, and this permission notice shall be 
included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Source: https://github.com/leggett/simplify-trackers/blob/a1fb5f2d5e52ec57e24929ce22099712b3c540ee/js/simplify-tracker-blocklist.js

export const emailTrackers = {
  '365offers.trade': 'trk.365offers.trade',
  'Absolutesoftware-email.com': 'click.absolutesoftware-email.com\\/open.aspx',
  'ActiveCampaign.com': 'lt.php(.*)\\?l=open',
  'ActionKit.com': 'track.sp.actionkit.com\\/q\\/',
  'Acoustic.com': 'mkt\\d{2,5}.(com|net)\\/open',
  'Adobe.com': [
    'demdex.net',
    't.info.adobesystems.com',
    'toutapp.com',
    '\\/trk\\?t=',
    'sparkpostmail2.com'
  ],
  'Active.com': 'click.email.active.com\\/q',
  'AgileCRM.com': 'agle2.me\\/open',
  'Airbnb.com': 'email.airbnb.com\\/wf\\/open',
  'AirMiles.ca': 'email.airmiles.ca\\/O',
  'Alaska Airlines': [
    'click.points-mail.com\\/open',
    'sjv.io\\/i\\/',
    'gqco.net\\/i\\/'
  ],
  'Amazon.com': [
    'awstrack.me',
    'aws-track-email-open',
    '\\/gp\\/r.html',
    '\\/gp\\/forum\\/email\\/tracking',
    'amazonappservices.com\\/trk',
    'amazonappservices.com\\/r\\/',
    'awscloud.com\\/trk'
  ],
  'Apple.com': [
    'apple.com\\/report\\/2\\/its_mail_sf',
    'apple_email_link\\/spacer'
  ],
  'Appriver.com': 'appriver.com\\/e1t\\/o\\/',
  'Apptivo.com': 'apptivo.com',
  'Asus.com': 'emditpison.asus.com',
  'TheAtlantic.com': 'links.e.theatlantic.com\\/open\\/log\\/',
  'AWeber.com': 'openrate.aweber.com',
  'Axios.com': 'link.axios.com\\/img\\/.*.gif',
  'BananaTag.com': 'bl-1.com',
  'Blueshift.com': [
    'blueshiftmail.com\\/wf\\/open',
    'getblueshift.com\\/track'
  ],
  'Bombcom.com': 'bixel.io',
  'BoomerangGmail.com': 'mailstat.us\\/tr',
  'Boots.com': 'boots.com\\/rts\\/open.aspx',
  'Boxbe.com': 'boxbe.com\\/stfopen',
  'Browserstack.com': 'browserstack.com\\/images\\/mail\\/track-open',
  'BuzzStream.com': 'tx.buzzstream.com',
  'CampaignMonitor.com': 'cmail(d{1,2}).com\\/t\\/',
  'CanaryMail.io': 'canarymail.io(:\\d+)?\\/track',
  'CirrusInsight.com': ['tracking.cirrusinsight.com', 'pardot.com\\/r\\/'],
  'Clio.com': 'market.clio.com\\/trk',
  'Close.io': ['close.(io|com)\\/email_opened', 'dripemail2'],
  'Cloudhq.io': ['cloudhq.io\\/mail_track', 'cloudhq-mkt\\d.net\\/mail_track'],
  'Coda.io': 'coda.io\\/logging\\/ping',
  'CodePen.io': 'mailer.codepen.io\\/q',
  'ConneQuityMailer.com': 'connequitymailer.com\\/open\\/',
  'ConstantContact.com': [
    'rs6.net\\/on.jsp',
    'constantcontact.com\\/images\\/p1x1.gif'
  ], // UglyEmail uses .net/on.jsp?
  'ContactMonkey.com': 'contactmonkey.com\\/api\\/v1\\/tracker',
  'ConvertKit.com': [
    'open.convertkit-mail\\d?.com',
    'convertkit-mail.com\\/o\\/'
  ],
  'Copper.com': 'prosperworks.com\\/tp\\/t',
  'Cprpt.com': '\\/o.aspx?t=',
  'Creditmantri.com': 'mailer.creditmantri.com\\/t\\/',
  'Critical Impact': 'portal.criticalimpact.com\\/c2\\/',
  'Customer.io': [
    'customeriomail.com\\/e\\/o',
    'track.customer.io\\/e\\/o',
    '\\/e\\/o\\/[a-zA-Z0-9]{63}'
  ],
  'Dell.com': 'ind.dell.com',
  'DidTheyReadIt.com': 'xpostmail.com',
  'DotDigital.com': ['trackedlink.net', 'dmtrk.net'],
  'Driftem.com': 'driftem.com\\/ltrack',
  'Dropbox.com': 'dropbox.com\\/l\\/',
  'DZone.com': 'mailer.dzone.com\\/open.php',
  'Ebsta.com': ['console.ebsta.com', 'ebsta.gif', 'ebsta.com\\/r\\/'],
  'EdgeSuite.net': 'epidm.edgesuite.net',
  'Egocdn.com': 'egocdn.com\\/syn\\/mail_s.php',
  'EmailTracker.website': 'my-email-signature.link',
  'Emarsys.com': 'emarsys.com\\/e2t\\/o\\/',
  'Etransmail.com': 'ftrans03.com\\/linktrack\\/',
  'EventBrite.com': 'eventbrite.com\\/emails\\/action',
  'EventsInYourArea.com': 'eventsinyourarea.com\\/track',
  'EveryAction.com': 'click.everyaction.com\\/j\\/',
  'Evite.com': ['pippio.com\\/api\\/sync', 'nli.evite.com\\/imp'],
  'Facebook.com': [
    'facebook.com\\/email_open_log_pic.php',
    'facebookdevelopers.com\\/trk',
    'fb.com\\/trk'
  ],
  'Flipkart.com': 'flipkart.com\\/t\\/open',
  'ForMirror.com': 'formirror.com\\/open\\/',
  'FreeLancer.com': 'freelancer.com\\/1px.gif',
  'FreshMail.com': [
    'mail.[a-zA-Z0-9-.]+.pl\\/o\\/',
    '\\/o\\/(\\w){10,}\\/(\\w){10,}'
  ],
  'FrontApp.com': ['app.frontapp.com\\/(.*)?\\/seen', 'web.frontapp.com\\/api'],
  'FullContact.com': 'fullcontact.com\\/wf\\/open',
  'GearBest.com': 'appinthestore.com\\/marketing\\/mail-user-deal\\/open',
  'Gem.com': 'zen.sr\\/o',
  'GetBase.com': 'getbase.com\\/e1t\\/o\\/',
  'GetMailSpring.com': 'getmailspring.com\\/open',
  'GetNotify.com': 'email81.com',
  'GetPocket.com': 'email.getpocket.com\\/wf\\/open',
  'GetResponse.com': 'getresponse.com\\/open.html', // UglyEmail uses open.html/?x=
  'Github.com': 'github.com\\/notifications\\/beacon',
  'GlassDoor.com': 'mail.glassdoor.com\\/pub\\/as',
  'Gmass.com': [
    'ec2-52-26-194-35.us-west-2.compute.amazonaws.com',
    'link.gmreg\\d.net',
    'gmreg\\d.net',
    'gmtrack.net'
  ],
  'Gmelius.com': 'gml.email',
  'Granicus.com': 'govdelivery.com(:\\d+)?\\/track',
  'GrowthDot.com': 'growthdot.com\\/api\\/mail-tracking',
  'Google.com': [
    'ad.doubleclick.net\\/ddm\\/ad',
    'google-analytics.com\\/collect',
    'google.com\\/appserve\\/mkt\\/img\\/'
  ],
  'Grammarly.com': 'grammarly.com\\/open',
  'GreenMailInc.com': 'greenmail.co.in',
  'Homeaway.com': 'trk.homeaway.com',
  'HubSpot.com': [
    't.(hubspotemail|hubspotfree|signaux|senal|signale|sidekickopen|sigopn|hsmsdd)',
    't.strk\\d{2}.email',
    'track.getsidekick.com',
    '\\/e2t\\/(o|c|to)\\/'
  ],
  'Hunter.io': 'mltrk.io\\/pixel',
  'iContact.com': 'click.icptrack.com\\/icp\\/',
  'Infusionsoft.com': 'infusionsoft.com\\/app\\/emailOpened',
  'Insightly.com': 'insgly.net\\/api\\/trk',
  'Intercom.com': [
    'intercom-mail[a-zA-Z0-9-.]*.com\\/(via\\/)?(o|q)',
    'via.intercom.io\\/o'
  ],
  'JangoMail.com': '\\/[a-z].z\\?[a-z]=',
  'InfusionSoft.com': 'infusionsoft.com\\/app\\/emailOpened',
  'Is-tracking-pixel-api-prod.appspot.com':
    'is-tracking-pixel-api-prod.appspot.com',
  'Klaviyo.com': 'trk.klaviyomail.com',
  'LaunchBit.com': 'launchbit.com\\/taz-pixel',
  'Linkedin.com': 'linkedin.com\\/emimp\\/',
  'Litmus.com': 'emltrk.com',
  'LogDNA.com': 'ping.answerbook.com',
  'Magento.com': [
    'magento.com\\/trk',
    'magento.com\\/wf\\/open',
    'go.rjmetrics.com'
  ],
  'Mailcastr.com': 'mailcastr.com\\/image\\/[a-zA-Z0-9-_]{64}',
  'MailChimp.com': 'list-manage.com\\/track',
  'MailCoral.com': 'mailcoral.com\\/open',
  'MailInifinity.com': 'mailinifinity.com\\/ptrack',
  'MailJet.com': ['mjt.lu\\/oo', 'links.[a-zA-Z0-9-.]+\\/oo\\/'],
  'MailGun.com': 'email.(mailgun|mg)(.*)\\?\\/o\\/',
  'MailButler.io': 'mailbutler.io\\/tracking\\/',
  'MailTag.io': 'mailtag.io\\/email-event',
  'MailTrack.io': ['mailtrack.io\\/trace', 'mltrk.io\\/pixel\\/'],
  'Mailzter.in': 'mailzter.in\\/ltrack',
  'MandrillApp.com': [
    'mandrill.\\S+\\/track\\/open.php',
    'mandrillapp.com\\/track'
  ],
  'Marketo.com': ['marketo.com\\/trk', '\\/trk\\?t='],
  'Mention.com': 'mention.com\\/e\\/o\\/',
  'MetaData.io': 'metadata.io\\/e1t\\/o\\/',
  'MixMax.com': [
    '(email|track).mixmax.com',
    'mixmax.com\\/api\\/track\\/',
    'mixmax.com\\/e\\/o'
  ],
  'MixPanel.com': 'mixpanel.com\\/(trk|track)',
  'MyEmma.com': ['e2ma.net\\/track', 't.e2ma.net'],
  'Nation Builder': [
    'nationbuilder.com\\/r\\/o',
    'nationbuilder.com\\/wf\\/open'
  ],
  'NeteCart.com': 'netecart.com\\/ltrack',
  'Nethunt.com': [
    'nethunt.com\\/api\\/v1\\/track\\/email\\/',
    'nethunt.co(.*)\\?\\/pixel.gif'
  ],
  'NewtonHQ.com': 'tr.cloudmagic.com',
  'OpenBracket.co': 'openbracket.co\\/track',
  'Opicle.com': 'track.opicle.com',
  'Oracle.com': [
    'tags.bluekai.com\\/site',
    'en25.com\\/e\\/',
    'dynect.net\\/trk.php',
    'bm5150.com\\/t\\/',
    'bm23.com\\/t\\/',
    '[a-zA-Z0-9-.]+\\/e\\/FooterImages\\/FooterImage'
  ],
  'Outreach.io': [
    'app.outreach.io',
    'api\\/mailings\\/opened',
    'outrch.com\\/api\\/mailings\\/opened',
    'getoutreach.com\\/api\\/mailings\\/opened'
  ],
  'PayBack.in': ['email.payback.in\\/a\\/', 'mail.payback.in\\/tr\\/'],
  'PayPal.com': 'paypal-communication.com\\/O\\/',
  'Paytm.com': ['email.paytm.com\\/wf\\/open', 'trk.paytmemail.com'],
  'phpList.com': ['\\/ut.php\\?u=', 'phplist.com\\/lists\\/ut.php'],
  'PipeDrive.com': ['pipedrive.com\\/wf\\/open', 'api.nylas.com\\/open'],
  'Playdom.com': 'playdom.com\\/g',
  'Polymail.io': ['polymail.io\\/v2\\/z', 'share.polymail.io'],
  'PostmarkApp.com': 'pstmrk.it',
  'ProductHunt.com': 'links.producthunt.com\\/oo\\/',
  'ProlificMail.com': 'prolificmail.com\\/ltrack',
  'Quora.com': 'quora.com\\/qemail\\/mark_read',
  'ReplyCal.com': 'replycal.com\\/home\\/index\\/\\?token',
  'ReplyMsg.com': 'replymsg.com',
  'Responder.co.il': 'opens.responder.co.il',
  'Return Path': 'returnpath.net\\/pixel.gif',
  'Rocketbolt.com': 'email.rocketbolt.com\\/o\\/',
  'Runtastic.com': 'runtastic.com\\/mo\\/',
  'Sailthru.com': 'sailthru.com\\/trk',
  'Salesforce.com': [
    'salesforceiq.com\\/t.png',
    'beacon.krxd.net',
    'app.relateiq.com\\/t.png',
    'nova.collect.igodigital.com',
    'exct.net\\/open.aspx',
    'click.[a-zA-Z0-9-.]+\\/open.aspx'
  ],
  'SalesHandy.com': 'saleshandy.com\\/web\\/email\\/countopened',
  'SalesLoft.com': 'salesloft.com\\/email_trackers',
  'Segment.com': 'email.segment.com\\/e\\/o\\/',
  'Selligent.com': 'strongview.com\\/t',
  'SendInBlue.com': ['sendibtd.com', 'sendibw{2}.com\\/track\\/'],
  'Sendgrid.com': [
    'sendgrid.(net|com)\\/wf\\/open',
    'sendgrid.(net|com)\\/trk',
    'sendgrid.(net|com)\\/mpss\\/o',
    'sendgrid.(net|com)\\/ss\\/o',
    'wf\\/open\\?upn'
  ],
  'SendPulse.email': 'stat-pulse.com',
  'Sendy.co': '\\/sendy\\/t\\/',
  'Signal.co': 'signl.live\\/tracker',
  'Skillsoft.com': 'skillsoft.com\\/trk',
  'Streak.com': ['mailfoogae.appspot.com', 'streak.com\\/e\\/o\\/'],
  'Substack.com': 'substack.com\\/o\\/',
  'Super Human': 'r.superhuman.com',
  'TataDocomoBusiness.com': 'tatadocomobusiness.com\\/rts\\/',
  'Techgig.com': 'tj_mailer_opened_count_all.php',
  'TheTopInbox.com': 'thetopinbox.com\\/track\\/',
  'TinyLetter.com': 'tinyletterapp.com\\.*\\?open.gif',
  'Thunderhead.com': 'na5.thunderhead.com',
  'ToutApp.com': 'go.toutapp.com',
  'TrackApp.io': [
    'trackapp.io\\/b\\/',
    'trackapp.io\\/r\\/',
    'trackapp.io\\/static\\/img\\/track.gif'
  ],
  'Transferwise.com': 'links.transferwise.com\\/track\\/',
  'Trello.com': ['sptrack.trello.com\\/q\\/', 'i.trellomail.com\\/e\\/eo'],
  'Udacity.com': 'udacity.com\\/wf\\/open',
  'Unsplash.com': 'email.unsplash.com\\/o\\/',
  'Upwork.com': 'email.mg.upwork.com\\/o\\/',
  'Vcommission.com': 'tracking.vcommission.com',
  'Vtiger.com': 'od2.vtiger.com\\/shorturl.php',
  'WildApricot.com': [
    'wildapricot.com\\/o\\/',
    'wildapricot.org\\/emailtracker'
  ],
  'Wix.com': 'shoutout.wix.com\\/[a-zA-Z0-9-.]*\\/pixel\\/',
  'Workona.com': 'workona.com\\/mk\\/op\\/',
  'Yamm.com': 'yamm-track.appspot',
  'YesWare.com': ['yesware.com\\/trk', 'yesware.com\\/t\\/', 't.yesware.com'],
  'Zendesk.com': 'futuresimple.com\\/api\\/v1\\/sprite.png',
  Unknown: [
    '\\/track\\/open',
    '\\/open.aspx\\?tp=',
    '\\/WebEvent\\/SetCookie.gif\\?tp=',
    'email.[a-zA-Z0-9-.]+\\/o\\/[a-zA-Z0-9-_.]{64}',
    '\\/smtp.mailopen'
  ]
}
