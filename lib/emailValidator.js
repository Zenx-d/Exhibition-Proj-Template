/**
 * Client-side email validation using the `validator` library.
 * Validates format, rejects disposable/temporary email providers,
 * and checks for common typos in popular domains.
 */
import isEmailValidator from 'validator/lib/isEmail';

// ─── Disposable / Temporary email domains blacklist ───────────────────────────
// Covers the most widely used throwaway email services
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
  'guerrillamail.biz', 'guerrillamail.de', 'guerrillamail.info', 'grr.la',
  'spam4.me', 'trashmail.com', 'trashmail.at', 'trashmail.io', 'trashmail.me',
  'trashmail.net', 'trashmail.org', 'trashmail.xyz', 'fakeinbox.com',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempr.email',
  'throwam.com', 'throwam.net', 'dispostable.com', 'discard.email',
  'yopmail.com', 'yopmail.fr', 'cool.fr.nf', 'jetable.fr.nf', 'nospam.ze.tc',
  'nomail.xl.cx', 'mega.zik.dj', 'speed.1s.fr', 'courriel.fr.nf',
  'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf', 'sharklasers.com',
  'guerrillamailblock.com', 'spam.la', 'maildrop.cc', 'mailnull.com',
  'mailnesia.com', 'spamgourmet.com', 'spamgourmet.net', 'spamgourmet.org',
  '10minutemail.com', '10minutemail.net', '10minutemail.org', '20minutemail.com',
  'mintemail.com', 'getonemail.com', 'getnada.com', 'filzmail.com',
  'mohmal.com', 'spamhero.com', 'spamzilla.com', 'spambox.us',
  'mailexpire.com', 'throwam.net', 'emailondeck.com', 'dingbone.com',
  'fakedemail.com', 'fleckens.hu', 'gustr.com', 'hat-geld.de', 'hmamail.com',
  'inboxbear.com', 'iroid.com', 'jetable.net', 'kasmail.com', 'klassmaster.com',
  'klassmaster.net', 'klzlk.com', 'kurzepost.de', 'lbe.kr', 'litedrop.com',
  'mail1a.de', 'maileimer.de', 'mailfreeonline.com', 'mailguard.me', 'mailimate.com',
  'mailmetrash.com', 'mailmoat.com', 'mailnew.com', 'mailscrap.com', 'mailsiphon.com',
  'mailslapping.com', 'mailslite.com', 'mailzilla.com', 'mailzilla.org',
  'mega.zik.dj', 'meltmail.com', 'mierdamail.com', 'moncourrier.fr.nf',
  'mt2014.com', 'mt2015.com', 'mytrashmail.com', 'netmails.com',
  'netmails.net', 'nobulk.com', 'nospam4.us', 'nospamfor.us', 'notmailinator.com',
  'objectmail.com', 'odaymail.com', 'omail.pro', 'oneoffmail.com',
  'pookmail.com', 'proxymail.eu', 'prtnx.com', 'punkass.com',
  'putthisinyourspamdatabase.com', 'qq.com', 'receiveee.com', 'rklips.com',
  'rmqkr.net', 'rppkn.com', 'rtrtr.com', 's0ny.net', 'safe-mail.net',
  'safetymail.info', 'safetypost.de', 'sandelf.de', 'scatmail.com',
  'secure-mail.biz', 'sendspamhere.com', 'shieldedmail.com', 'shiftmail.com',
  'shortmail.net', 'sibmail.com', 'skeefmail.com', 'slapsfromlastnight.com',
  'slopsbox.com', 'slushmail.com', 'smashmail.de', 'smellfear.com', 'smokedham.com',
  'snakemail.com', 'sneakemail.com', 'sneakmail.de', 'sofimail.com', 'sogetthis.com',
  'spam.su', 'spamavert.com', 'spambogusman.com', 'spamcon.org', 'spamcorptastic.com',
  'spamcowboy.com', 'spamcowboy.net', 'spamcowboy.org', 'spamday.com', 'spamex.com',
  'spamfree24.de', 'spamfree24.eu', 'spamfree24.info', 'spamfree24.net',
  'spamfree24.org', 'spamgoes.in', 'spammail.me', 'spamobox.com', 'spamoff.de',
  'spamstack.net', 'spamtrap.ro', 'spamtrash.net', 'spamwc.de', 'spamwc.net',
  'spamwc.org', 'speed.1s.fr', 'spoofmail.de', 'stinkefinger.net', 'stuffmail.de',
  'super-auswahl.de', 'supergreatmail.com', 'supermailer.jp', 'superrito.com',
  'superstachel.de', 'suremail.info', 'sweetxxx.de', 'tafmail.com', 'tagyourself.com',
  'tapchicuoihoi.com', 'teewars.org', 'teleworm.com', 'teleworm.us',
  'temporaryemail.net', 'temporaryemail.us', 'temporaryforwarding.com',
  'temporaryinbox.com', 'thanksnospam.info', 'thisisnotmyrealemail.com',
  'throam.com', 'throwam.com', 'tilien.com', 'tittbit.in', 'tizi.com',
  'tmailinator.com', 'toiea.com', 'topymail.com', 'tradermail.info', 'trash-mail.at',
  'trash-mail.com', 'trash-mail.de', 'trash-mail.ga', 'trash-mail.io',
  'trash-mail.ml', 'trash-mail.net', 'trash2009.com', 'trash2010.com',
  'trash2011.com', 'trashcanmail.com', 'trashdevil.com', 'trashdevil.de',
  'trashemail.de', 'trashmailer.com', 'trashme.net', 'trashy.de', 'trbvm.com',
  'trillianpro.com', 'tryalert.com', 'turual.com', 'twinmail.de', 'tyldd.com',
  'ubm.md', 'umail.net', 'unlimit.com', 'uroid.com', 'us.af',
  'venompen.com', 'veryrealemail.com', 'vidchart.com', 'viditag.com',
  'viewcastmedia.com', 'viewcastmedia.net', 'viewcastmedia.org', 'vomoto.com',
  'vubby.com', 'walala.org', 'walkmail.net', 'walkmail.ru', 'wetrainbayarea.com',
  'wetrainbayarea.org', 'whyspam.me', 'willhackforfood.biz', 'willselfdestruct.com',
  'winemaven.info', 'wronghead.com', 'wuzupmail.net', 'www.e4ward.com',
  'www.mailinator.com', 'wwwnew.eu', 'xagloo.com', 'xemaps.com', 'xents.com',
  'xmaily.com', 'xoxy.net', 'xyzfree.net', 'yapped.net', 'yeah.net',
  'yep.it', 'yogamaven.com', 'yomail.info', 'ypmail.webarnak.fr.eu.org',
  'yuurok.com', 'z1p.biz', 'za.com', 'zehnminuten.de', 'zehnminutenmail.de',
  'zetmail.com', 'zippymail.info', 'zoaxe.com', 'zoemail.net', 'zoemail.org',
  'zomg.info', 'zxcv.com', 'zxcvbnm.com', 'zzz.com',
  // More popular ones
  'anonbox.net', 'anonymail.dk', 'anonymbox.com', 'antispam24.de',
  'binkmail.com', 'bobmail.info', 'bodhi.lawlita.com', 'bofthew.com',
  'boun.cr', 'boxformail.in', 'bund.us', 'bunsenhoneydew.com',
  'casualdx.com', 'ce.mintemail.com', 'chong-mail.net', 'crazymailing.com',
  'deadaddress.com', 'deadletter.ga', 'despam.it', 'devnullmail.com',
  'dfgh.net', 'digitalsanctuary.com', 'discardmail.com', 'discardmail.de',
  'dispostable.com', 'dodgeit.com', 'dontreg.com', 'dontsendmespam.de',
  'drdrb.com', 'drdrb.net', 'dump-email.info', 'dumpandfuck.com',
  'dumpmail.de', 'dumpyemail.com', 'e4ward.com', 'emailgo.de', 'emailisvalid.com',
  'emailtemporanea.com', 'emailtemporanea.net', 'emailtemporario.com.br',
  'emailthe.net', 'emailtmp.com', 'emailwarden.com', 'emailx.at.hm',
  'emailxfer.com', 'emkei.cz', 'emz.net', 'ephemail.net', 'etranquil.com',
  'etranquil.net', 'etranquil.org', 'evopo.com', 'explodemail.com',
  'express.net.ua', 'extremail.ru', 'ez.lv', 'ezstest.com',
  'f4k.es', 'fake-email.pp.ua', 'fakemailgenerator.com', 'fakemailgenerator.net',
  'fammix.com', 'faux.name', 'fightallspam.com',
]);

// ─── Common domain typo suggestions ───────────────────────────────────────────
const COMMON_DOMAIN_TYPOS = {
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gnail.com': 'gmail.com',
  'yahooo.com': 'yahoo.com',
  'yahoo.co': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'hotmil.com': 'hotmail.com',
  'hotmail.co': 'hotmail.com',
  'outloook.com': 'outlook.com',
  'outook.com': 'outlook.com',
  'outlok.com': 'outlook.com',
  'icloud.co': 'icloud.com',
  'protonmai.com': 'protonmail.com',
  'protonmal.com': 'protonmail.com',
};

/**
 * Validate an email address client-side.
 * Returns { valid: boolean, error: string | null, suggestion: string | null }
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required.', suggestion: null };
  }

  const trimmed = email.trim().toLowerCase();

  // 1. Basic format check using validator library
  const isFormat = isEmailValidator(trimmed, {
    allow_utf8_local_part: false,
    require_tld: true,
    allow_ip_domain: false,
    blacklisted_chars: '',
  });

  if (!isFormat) {
    return { valid: false, error: 'Please enter a valid email address.', suggestion: null };
  }

  const [, domain] = trimmed.split('@');

  // 2. Typo detection
  const suggestion = COMMON_DOMAIN_TYPOS[domain]
    ? `Did you mean ${trimmed.replace(domain, COMMON_DOMAIN_TYPOS[domain])}?`
    : null;

  if (suggestion) {
    // Still invalid if it's a known typo
    return { valid: false, error: 'Check your email address.', suggestion };
  }

  // 3. Disposable domain check
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      error: 'Disposable email addresses are not allowed. Please use your real email.',
      suggestion: null,
    };
  }

  // 4. Basic TLD sanity (must be >= 2 chars)
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2) {
    return { valid: false, error: 'Please enter a valid email domain.', suggestion: null };
  }

  return { valid: true, error: null, suggestion: null };
}
