'use strict';
'require view';
'require form';
'require rpc';
'require poll';
'require tools.widgets as widgets';

var getStatus = rpc.declare({ object: 'mf297d.ttl', method: 'status', expect: {} });

return view.extend({
	render: function() {
		var box = E('div', { 'class': 'cbi-section' }, _('Loading status…'));
		var m = new form.Map('mf297d-ttl', _('TTL Control'),
			_('Set a fixed IPv4 TTL on packets leaving the selected internet connections. The default value is 64.'));
		var s = m.section(form.NamedSection, 'main', 'settings');
		s.anonymous = true;
		var o = s.option(form.Flag, 'enabled', _('Enable'));
		o.rmempty = false;
		o = s.option(form.Value, 'ttl', _('IPv4 TTL'));
		o.datatype = 'range(1,255)'; o.default = '64'; o.rmempty = false;
		o = s.option(widgets.NetworkSelect, 'networks', _('Outgoing networks'),
			_('Select lte for mobile broadband, wan for wired internet, or both.'));
		o.multiple = true; o.nocreate = true; o.rmempty = false;
		o = s.option(form.Flag, 'ipv6', _('Also set IPv6 Hop Limit'));
		o.rmempty = false;
		o = s.option(form.Value, 'hop_limit', _('IPv6 Hop Limit'));
		o.datatype = 'range(1,255)'; o.default = '64'; o.rmempty = false;
		o.depends('ipv6', '1');
		return m.render().then(function(node) {
			poll.add(function() {
				return getStatus().then(function(st) {
					var label = !st.enabled ? _('Disabled') : st.error ? _('Failed to apply') :
						st.active && st.devices.trim() ? _('Active') : _('Waiting for a connection');
					var rows = [E('p', {}, [E('strong', {}, label)]),
						E('p', {}, _('Outgoing devices: ') + (st.devices || '—')),
						E('p', {}, _('Packets matched: ') + (st.packets || 0))];
					if (st.error) rows.push(E('p', { 'class': 'alert-message warning' }, st.error));
					if (st.enabled && st.ecm_present) rows.push(E('p', {},
						_('While enabled, IPv4 ECM flow acceleration is paused for all connections; Wi-Fi NSS remains enabled. Disabling TTL control restores the previous ECM state.')));
					box.replaceChildren.apply(box, rows);
				}).catch(function() { box.textContent = _('Status service is unavailable.'); });
			}, 5);
			return E('div', {}, [node, box, E('p', {},
				_('If software or hardware flow offloading is enabled, disable it under Network → Firewall and apply those settings first. IPv6 packets are unchanged unless IPv6 Hop Limit is enabled.'))]);
		});
	}
});
