include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-mf297d-ttl
PKG_VERSION:=1.0.1
PKG_RELEASE:=1
PKG_LICENSE:=GPL-2.0-only

LUCI_TITLE:=LuCI TTL and Hop Limit control
LUCI_URL:=https://github.com/ozgunokan/luci-app-ttl
LUCI_MAINTAINER:=ozgunokan
LUCI_DEPENDS:=+luci-base +firewall4 +nftables-json +kmod-nft-core +rpcd
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
