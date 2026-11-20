# LuCI TTL Control

Set a fixed outgoing IPv4 TTL, with an optional IPv6 Hop Limit, from **Network → TTL Control**.
Default TTL: **64**. Disabled by default. English is the source language; an optional Turkish translation is included.

The OpenWrt package name is **`luci-app-ttl`**.
It was built and tested on the MF297D OpenWrt 6.18.60 NSS port. Other devices/builds have not been hardware-tested.
Requires modern JavaScript LuCI, firewall4/nftables, nftables JSON support, and rpcd.

## Add to your existing OpenWrt build

Run these commands **inside Ubuntu/VMware**, as your normal build user:

```sh
cd ~/build-mf297d-nand
git clone https://github.com/ozgunokan/luci-app-ttl.git package/luci-app-ttl
make defconfig
make menuconfig
```

Under **LuCI → Applications**, select **`luci-app-ttl`**:

- `<*>` / `Y`: include it in the firmware.
- `<M>` / `M`: build a separate installable package.

Save and exit. For a separate package:

```sh
make package/luci-app-ttl/compile -j2 V=s
find bin/packages -name '*mf297d-ttl*.apk' -o -name '*mf297d-ttl*.ipk'
```

To continue your MF297D firmware build after selecting `<*>`:

```sh
JOBS=8 sh ~/MF297D/nss/build.sh nand "$PWD"
```

Do not rerun the MF297D initial configure script over an already prepared build tree.
Building a package or firmware does not flash your router.

## Install the prebuilt package

Download the APK and `SHA256SUMS` from [Releases](https://github.com/ozgunokan/luci-app-ttl/releases).
This APK is for the tested APK-based MF297D build. For an opkg-based firmware, build its matching IPK instead.
From your PC:

```sh
sha256sum -c SHA256SUMS --ignore-missing
scp -O luci-app-ttl-1.0.2-r2.apk root@192.168.1.1:/tmp/
ssh root@192.168.1.1
```

Then, **on the router**:

```sh
apk add --no-network --allow-untrusted /tmp/luci-app-ttl-1.0.2-r2.apk
/etc/init.d/mf297d-ttl enable
/etc/init.d/mf297d-ttl restart
/etc/init.d/rpcd restart
```

The locally built APK is not signed by the official OpenWrt feed key; verify the release checksum before using `--allow-untrusted`.
Reload LuCI (Ctrl+F5 if needed), then open **Network → TTL Control**.

## Use

1. Enable TTL control and enter a value from **1 to 255** (default **64**).
2. Select `lte` for the mobile connection, `wan` for wired internet, or both.
3. Optionally enable IPv6 Hop Limit and choose its value separately.
4. Click **Save & Apply**. The page shows resolved output devices, errors and matching packet counters.

An offline connection is shown as **Waiting for a connection**. Logical networks are resolved to current `l3_device` names;
interface-up/update/down events refresh the rules. IPv6 is unchanged unless the optional setting is enabled.

### NSS and flow offloading

**TTL control pauses IPv4 ECM IP-flow acceleration globally while enabled, including connections outside the selected output networks.**
This prevents subsequent accelerated packets from bypassing the TTL rule. Wi-Fi NSS remains loaded and enabled;
this does not mean end-to-end IPv4 ECM acceleration remains enabled. Throughput and CPU use may change.
IPv6 ECM is also paused when IPv6 Hop Limit is enabled. Disabling TTL restores each family's previous ECM stop flag.
Existing accelerated connections are decelerated before the new rule is activated.

Software/hardware firewall flow offloading must be disabled under **Network → Firewall** first.
The application refuses activation if the configured fw4 offloading or its active `ft` flowtable would bypass the rule.
It does not edit your firewall settings, restart NSS/Wi-Fi, or flush the fw4 table.
Rules are atomically replaced in a separate `inet mf297d_ttl` table and survive a normal `fw4 reload`.

TTL rewriting occurs in postrouting. A packet already expired during forwarding is not revived.
The guard is rechecked periodically; manually reloading acceleration modules while TTL is active can create a transition window.

## Language

English labels are built into the application. `po/tr/mf297d-ttl.po` provides Turkish labels.
Build/install `luci-i18n-ttl-tr` if you want Turkish, then choose Turkish in LuCI's language settings.
Installing the English application does not change the system language.

## Tested

- IPv4: **800/800** forwarded test packets, input TTL 32/128, observed output TTL **64**.
- IPv6: **800/800** forwarded test packets, input Hop Limit 32/128, observed output **64**.
- Both ECM accelerated counts stayed zero during this test; previous stop flags were restored when disabled.
- Firewall reload preserved the table; invalid TTL 999 was rejected while previous valid rules were retained.
- LuCI menu/form, status RPC and Save & Apply enable/disable round trip were tested in a real browser.
- English 1.0.2 update preserved application settings and used the same tested backend.

Tests used two virtual peers over physical LAN. This is **not** a live LTE/WAN packet capture or a throughput test.
No claims are made about operator policies. See [tests/VALIDATION.json](tests/VALIDATION.json).

## Türkçe kısa kullanım

Ubuntu derleme alanında yukarıdaki `git clone` komutunu çalıştır. `make menuconfig` içinde
**LuCI → Applications → luci-app-ttl** seç; firmware'e eklemek için `<*>` yap.
LuCI'de **Network → TTL Control** sayfasından TTL64 ve WAN/LTE seçimini yapıp **Save & Apply** kullan.
TTL açıkken IPv4 ECM hızlandırması tüm bağlantılarda duraklar; Wi-Fi NSS açık kalır. Kapatınca eski ECM durumu geri gelir.

GPL-2.0-only. No owner credentials, modem firmware, calibration data or private keys are included.

## Upgrade from the old package name

The package was renamed in 1.0.2. If you cloned an earlier revision, move its
`package/luci-app-mf297d-ttl` directory outside the build tree before cloning
the current repository into `package/luci-app-ttl`. Do not select both packages.
After `make defconfig`, select `luci-app-ttl` in menuconfig.

On a router with the old package installed, back up `/etc/config/mf297d-ttl`,
remove `luci-app-mf297d-ttl`, install `luci-app-ttl`, restore that configuration,
and restart the service. The internal config/service/RPC names remain unchanged
to preserve existing settings and bookmarks; the installable package is `luci-app-ttl`.
