include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-ttl
PKG_VERSION:=1.0.2
PKG_RELEASE:=2
PKG_PO_VERSION:=1.0.2
PKG_LICENSE:=GPL-2.0-only

LUCI_TITLE:=LuCI TTL and Hop Limit control
LUCI_URL:=https://github.com/ozgunokan/luci-app-ttl
LUCI_MAINTAINER:=ozgunokan
LUCI_DEPENDS:=+luci-base +firewall4 +nftables-json +kmod-nft-core +rpcd
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
