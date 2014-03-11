var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);
var _ = require('lodash-node');

function sendEmail(options, callback) {
  function success(result) {
    callback(null, result);
  }
  function failure(error) {
    callback(error);
  }
  var fnName = 'send';
  if (options['template_name']) {
    fnName = 'sendTemplate';
  }
  mandrill_client.messages[fnName](options, success, failure);
}

function getDefaultMessage(user, tags) {
  if (!_.isArray(tags)) {
    tags = [tags];
  }
  return {
    'from_email': 'info@bucktstreams.com',
    'from_name': 'Bucket Streams',
    to: [
      {
        email: user.email,
        name: user.getDisplayName() || user.email,
        type: 'to'
      }
    ],
    headers: {
      'Reply-To': 'info@bucktstreams.com'
    },
    tags: tags,
    'google_analytics_domains': [
      'bucketstreams.com'
    ]
  };
}

function sendTestMessage(callback) {
  var message = {
    html: '<p>Example <a href="http://www.google.com">HTML</a> content</p>',
    text: 'Example text content',
    subject: 'Test subject',
    'from_email': 'info@bucktstreams.com',
    'from_name': 'Bucket Streams',
    to: [
      {
        email: 'kent+bucketstreams@doddsfamily.us',
        name: 'Kent C. Dodds',
        type: 'to'
      }
    ],
    headers: {
      'Reply-To': 'info@bucktstreams.com'
    },
    tags: [
      'test-message'
    ],
    'google_analytics_domains': [
      'bucketstreams.com'
    ]
  };
  sendEmail({message: message}, callback);
}

function sendTestTemplate(callback) {
  var message = {
    subject: 'Test Template subject',
    'from_email': 'info@bucktstreams.com',
    'from_name': 'Bucket Streams',
    to: [
      {
        email: 'kent+bucketstreams@doddsfamily.us',
        name: 'Kent C. Dodds',
        type: 'to'
      }
    ],
    'global_merge_vars': [
      {
        name: 'MY_MERGE',
        content: 'This rocks!'
      }
    ],
    headers: {
      'Reply-To': 'info@bucktstreams.com'
    },
    tags: [
      'test-template-message'
    ],
    'google_analytics_domains': [
      'bucketstreams.com'
    ]
  };

  sendEmail({
    'template_name': 'basic',
    'message': message
  }, callback);
}

function sendEmailConfirmationEmail(user, callback) {
  var message = getDefaultMessage(user, 'email-confirmation');
  message = _.extend(message, {
    subject: 'Welcome to Bucket Streams!',
    'from_email': 'info@bucktstreams.com',
    'from_name': 'Bucket Streams',
    'global_merge_vars': [
      {
        name: 'emailConfirmationLink',
        content: process.env.BASE_URL + '/confirm-email/' + user.emailConfirmation.secret
      },
      {
        name: 'email',
        content: user.email
      }
    ]
  });

  sendEmail({
    'template_name': 'email-confirmation',
    'template_content': [
      {
        'name': 'what-is-this-for',
        'content': '.'
      }
    ],
    'message': message
  }, callback);
}

function sendPasswordResetEmail(user) {
  var message = getDefaultMessage(user, 'email-confirmation');
  message = _.extend(message, {
    subject: 'Password Reset - Bucket Streams',
    'from_email': 'info@bucktstreams.com',
    'from_name': 'Bucket Streams',
    'global_merge_vars': [
      {
        name: 'passwordResetLink',
        content: process.env.BASE_URL + '/reset-password/' + user.passwordReset.secret
      },
      {
        name: 'userName',
        content: user.getDisplayName() || user.email
      }
    ]
  });

  sendEmail({
    'template_name': 'email-confirmation',
    'template_content': [
      {
        'name': 'what-is-this-for',
        'content': '.'
      }
    ],
    'message': message
  }, callback);
}

module.exports = {
  sendTestMessage: sendTestMessage,
  sendTestTemplate: sendTestTemplate,
  sendEmailConfirmationEmail: sendEmailConfirmationEmail,
  sendPasswordResetEmail: sendPasswordResetEmail
};