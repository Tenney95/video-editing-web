interface MenuItem {
  title: string,
  key: string,
  active?: boolean,
  icon: string
}
const menuData: MenuItem[] = [
  { title: '本地', key: 'local', icon: 'material-symbols:sync-saved-locally' },
  { title: '图片', key: 'image', icon: 'material-symbols:imagesmode' },
  { title: '视频', key: 'video', icon: 'material-symbols:auto-videocam' },
  { title: '音频', key: 'audio', icon: 'material-symbols:audio-file' },
  { title: '文字', key: 'text', icon: 'material-symbols:text-snippet-rounded' }
];

export { menuData };
export type { MenuItem };