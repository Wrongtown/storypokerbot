var debug = require('debug')('botkit:slash_command');
var dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).slack;

module.exports = function(controller) {

  // create special handlers for certain actions in buttons
  // if the button action is 'action', trigger an event
  // if the button action is 'say', act as if user said that thing
  controller.on('interactive_message_callback', function(bot, trigger) {
    console.log(trigger);
    dashbot.logIncoming(bot.identity, bot.team_info, trigger);

    // if (trigger.actions[0].name.match(/^action$/)) {
    //     controller.trigger(trigger.actions[0].value, [bot, trigger]);
    //     return false; // do not bubble event
    // }
    // if (trigger.actions[0].name.match(/^say$/)) {

    //     var message = {
    //         user: trigger.user,
    //         channel: trigger.channel,
    //         text: '<@' + bot.identity.id + '> ' + trigger.actions[0].value,
    //         type: 'message',
    //     };

    //     var reply = trigger.original_message;

    //     for (var a = 0; a < reply.attachments.length; a++) {
    //         reply.attachments[a].actions = null;
    //     }

    //     var person = '<@' + trigger.user.id + '>';
    //     if (message.channel[0] == 'D') {
    //         person = 'You';
    //     }

    //     reply.attachments.push({
    //         text: person + ' said, ' + trigger.actions[0].value,
    //     });

    //     reply.channel = message.channel;
    //     dashbot.logOutgoing(bot.identity, bot.team_info, reply);
    //     bot.replyInteractive(trigger, reply);

    //     controller.receiveMessage(bot, message);
    //     return false; // do not bubble event
    // }
    if (trigger.callback_id.match(/^select_poker_action$/)) {

      var message = {
        user: trigger.user,
        channel: trigger.channel,
        text: '<@' + bot.identity.id + '> ' + trigger.actions[0].value,
        type: 'message',
      };

      if (trigger.actions[0].name.match(/^Reveal$/)) {
        var reply = trigger.original_message;

        var value = JSON.parse(reply.attachments[2].actions[0].value);

        reply.attachments = [ {
          "fallback": "Pre-filled because you have actions in your attachment.",
          "color": "#bdc3c7",
          "mrkdwn_in": [
            "text",
            "pretext",
            "fields"
          ],
          "callback_id": "select_poker_action",
          "attachment_type": "default",
          "actions": [
            {
              "name": "Repoint",
              "text": "Repoint",
              "type": "button",
              "style": "default",
              "value": `${JSON.stringify({})}`
            },
            {
              "name": "Done",
              "text": "Done",
              "type": "button",
              "style": "default",
              "value": `${JSON.stringify(value)}`

            },
            {
              "name": "Dismiss",
              "text": "Dismiss",
              "type": "button",
              "style": "default",
              "value": "Dismiss"
            }
          ]
        }];
        let graph = {
          '0': 0, '1': 0, '2': 0, '3': 0, '5': 0, '8': 0,
          '13': 0, '21': 0, '34': 0, '55': 0
        };
        Object.keys(value).forEach(function(key, index) {
          graph[value[key]] += 1;
          reply.attachments.push({
            text: `<@${key}> pointed: ${value[key]}`
          });
        });
        let graph_string = ['Points ▼ │ Count ►','──┬───'];
        let graph_data = [];
        Object.keys(graph).forEach(function(point, index) {
          let count = graph[point];
          let count_str = count === 0 ? '' : count;
          graph_data.push(count);
          graph_string.push(point.padStart(2) + '│' + '█'.repeat(count) + ' ' + count_str);
        });
        graph_string.push('──┴───');

        // reply.attachments[0].pretext = `\`\`\`${graph_string.join('\n')}\`\`\``;
        // `http://chart.apis.google.com/chart?chs=480x256&cht=bvs&chtt=LivePreview&chd=s:CDDEFH,Wps679&chco=ff0000,0000ff&chdl=sales|visits&chxl=0:|jan|feb|mar|apr|may|jun|&chxt=x`
        // reply.attachments[0].image_url = `http://chart.apis.google.com/chart?` +
        //   `cht=bvs&` +
        //   `chs=160x160&` +
        //   `chd=s:AAAAAAAzA&` +
        //   `chdl=Points&` +
        //   `chco=5131C9&` +
        //   `chxt=x&` +
        //   `chxl=0:|1|2|3|5|8|13|21|34|55&` +
        //   `chxs=0,000000,8,-1&` +
        //   `chf=bg,s,FFFFFF|c,s,FFFFFF&` +
        //   `chbh=a&` +
        //   `chtt=Points%20Histogram&` +
        //   `chts=000000,12`;
        // http://chart.googleapis.com/chart?cht=bvg&chs=250x150&chd=s:Monkeys&chxt=x,y&chxs=0,ff0000,12,0,lt|1,0000ff,10,1,lt
        // https://chart.googleapis.com/chart?cht=bhg&chs=200x125&chd=s:el,or&chco=4d89f9,c6d9fd

        reply.attachments[0].image_url = `https://chart.googleapis.com/chart?cht=bvs&chs=480x270&chd=t:${graph_data.join(',')}&chdl=Points&chco=5131C9&chxt=x&chxl=0:|0|1|2|3|5|8|13|21|34|55&chxs=0,000000,14,-1&chf=bg,s,FFFFFF|c,s,FFFFFF&chbh=a&chtt=Points%20Histogram&chts=000000,12&chds=a&chm=N,000000,0,-1,11`

        console.log(reply.attachments);
      } else if(trigger.actions[0].name.match(/^Done$/)) {
        var reply = trigger.original_message;


        var value = JSON.parse(trigger.actions[0].value);

        reply.attachments = [ {
          "fallback": "Pre-filled because you have actions in your attachment.",
          "color": "#bdc3c7",
          "mrkdwn_in": [
            "text",
            "pretext",
            "fields"
          ],
          "callback_id": "select_poker_action",
          "attachment_type": "default"
        }];
        let graph = {
          '0': 0, '1': 0, '2': 0, '3': 0, '5': 0, '8': 0,
          '13': 0, '21': 0, '34': 0, '55': 0
        };
        Object.keys(value).forEach(function(key, index) {
          graph[value[key]] += 1;
          reply.attachments.push({
            text: `<@${key}> pointed: ${value[key]}`
          });
        });
        let graph_string = ['Points ▼ │ Count ►','──┬───'];
        let graph_data = [];
        Object.keys(graph).forEach(function(point, index) {
          let count = graph[point];
          let count_str = count === 0 ? '' : count;
          graph_data.push(count);
          graph_string.push(point.padStart(2) + '│' + '█'.repeat(count) + ' ' + count_str);
        });
        graph_string.push('──┴───');

        // reply.attachments[0].pretext = `\`\`\`${graph_string.join('\n')}\`\`\``;
        // `http://chart.apis.google.com/chart?chs=480x256&cht=bvs&chtt=LivePreview&chd=s:CDDEFH,Wps679&chco=ff0000,0000ff&chdl=sales|visits&chxl=0:|jan|feb|mar|apr|may|jun|&chxt=x`
        // reply.attachments[0].image_url = `http://chart.apis.google.com/chart?` +
        //   `cht=bvs&` +
        //   `chs=160x160&` +
        //   `chd=s:AAAAAAAzA&` +
        //   `chdl=Points&` +
        //   `chco=5131C9&` +
        //   `chxt=x&` +
        //   `chxl=0:|1|2|3|5|8|13|21|34|55&` +
        //   `chxs=0,000000,8,-1&` +
        //   `chf=bg,s,FFFFFF|c,s,FFFFFF&` +
        //   `chbh=a&` +
        //   `chtt=Points%20Histogram&` +
        //   `chts=000000,12`;
        // http://chart.googleapis.com/chart?cht=bvg&chs=250x150&chd=s:Monkeys&chxt=x,y&chxs=0,ff0000,12,0,lt|1,0000ff,10,1,lt
        // https://chart.googleapis.com/chart?cht=bhg&chs=200x125&chd=s:el,or&chco=4d89f9,c6d9fd

        reply.attachments[0].image_url = `https://chart.googleapis.com/chart?cht=bvs&chs=480x270&chd=t:${graph_data.join(',')}&chdl=Points&chco=5131C9&chxt=x&chxl=0:|0|1|2|3|5|8|13|21|34|55&chxs=0,000000,14,-1&chf=bg,s,FFFFFF|c,s,FFFFFF&chbh=a&chtt=Points%20Histogram&chts=000000,12&chds=a&chm=N,000000,0,-1,11`

        console.log(reply.attachments);
      } else if(trigger.actions[0].name.match(/^Repoint$/)) {
        var person = '<@' + trigger.user + '>';
        var value = {};
        var reply =  trigger.original_message;
        reply.attachments =  [
          {
            "fallback": "Pre-filled because you have actions in your attachment.",
            "color": "#bdc3c7",
            "mrkdwn_in": [
              "text",
              "pretext",
              "fields"
            ],
            "callback_id": "select_point_action",
            "attachment_type": "default",
            "actions": [
              {
                "name": "1",
                "text": "1",
                "type": "button",
                "style": "default",
                "value": "1"
              },
              {
                "name": "2",
                "text": "2",
                "type": "button",
                "style": "default",
                "value": "2"
              },
              {
                "name": "3",
                "text": "3",
                "type": "button",
                "style": "default",
                "value": "3"
              },
              {
                "name": "5",
                "text": "5",
                "type": "button",
                "style": "default",
                "value": "5"
              },
              {
                "name": "8",
                "text": "8",
                "type": "button",
                "style": "default",
                "value": "8"
              }
            ]
          },
          {
            "fallback": "Pre-filled because you have actions in your attachment.",
            "color": "#bdc3c7",
            "mrkdwn_in": [
              "text",
              "pretext",
              "fields"
            ],
            "callback_id": "select_point_action",
            "attachment_type": "default",
            "actions": [
              {
                "name": "Select point",
                "text": "Select point",
                "type": "select",
                "value": "Select point",
                "data_source": "static",
                "options": [
                  {
                    "text": "0",
                    "value": "0"
                  },
                  {
                    "text": "1",
                    "value": "1"
                  },
                  {
                    "text": "2",
                    "value": "2"
                  },
                  {
                    "text": "3",
                    "value": "3"
                  },
                  {
                    "text": "5",
                    "value": "5"
                  },
                  {
                    "text": "8",
                    "value": "8"
                  },
                  {
                    "text": "13",
                    "value": "13"
                  },
                  {
                    "text": "21",
                    "value": "21"
                  },
                  {
                    "text": "34",
                    "value": "34"
                  },
                  {
                    "text": "55",
                    "value": "55"
                  }
                ]
              }
            ]
          },
          {
            "fallback": "Pre-filled because you have actions in your attachment.",
            "color": "#bdc3c7",
            "mrkdwn_in": [
              "text",
              "pretext",
              "fields"
            ],
            "callback_id": "select_poker_action",
            "attachment_type": "default",
            "actions": [
              {
                "name": "Reveal",
                "text": "Reveal",
                "type": "button",
                "style": "default",
                "value": `${JSON.stringify(value)}`
              },
              {
                "name": "Repoint",
                "text": "Repoint",
                "type": "button",
                "style": "default",
                "value": `${JSON.stringify(value)}`
              },
              {
                "name": "Dismiss",
                "text": "Dismiss",
                "type": "button",
                "style": "default",
                "value": "Dismiss"
              }
            ]
          }
        ]


      } else if(trigger.actions[0].name.match(/^Dismiss$/)){
        var person = '<@' + trigger.user + '>';
        var reply = trigger.original_message;
        reply.attachments = [];
        reply.attachments.push({
          "text": `${person} has dismissed`
        });
      }

      //console.log(JSON.stringify(reply));

      // console.log(reply);
      reply.channel = message.channel;
      // dashbot.logOutgoing(bot.identity, bot.team_info, reply);
      bot.replyInteractive(trigger, reply);

      return false; // do not bubble event
    } else if (trigger.callback_id.match(/^select_point_action$/)) {
      var message = {
        user: trigger.user,
        channel: trigger.channel,
        text: '<@' + bot.identity.id + '> ' + trigger.actions[0].value,
        type: 'message',
      };

      var reply = trigger.original_message;

      var person = '<@' + trigger.user + '>';
      if (message.channel[0] == 'D') {
        person = 'You';
      }
      var action_payload;
      if (trigger.actions[0].type === 'select') {
        console.log('action_payload select');
        action_payload = trigger.actions[0].selected_options[0].value;
        console.log('action_payload');
        console.log(trigger.actions[0].selected_options[0]);
      } else {
        console.log('action_payload button');
        action_payload = trigger.actions[0].value;
        console.log('action_payload');
        console.log(trigger.actions[0]);
      }

      var value = JSON.parse(reply.attachments[2].actions[0].value);

      console.log('action_payload');
      console.log(action_payload);
      value[trigger.user] = action_payload;
      console.log('Updated value');
      console.log(JSON.stringify(value));

      reply.attachments[2].actions[0].value = `${JSON.stringify(value)}`;
      let user_count = Object.keys(value).length;
      reply.attachments[0].pretext = `Total Pointed: \`${user_count}\``;
      reply.attachments[3] = {
        "text": `${Object.keys(value).map(u => '<@' + u + '>').join(', ')} has pointed`
      };

      //console.log(JSON.stringify(reply));

      // console.log(reply);
      reply.channel = message.channel;
      // dashbot.logOutgoing(bot.identity, bot.team_info, reply);
      bot.replyInteractive(trigger, reply);

      return false; // do not bubble event
    }

  });


};
