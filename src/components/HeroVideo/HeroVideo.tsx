import styles from './HeroVideo.module.css'

const VIDEO_URL = 'REEMPLAZAR_CON_URL_DE_SUPABASE'

export function HeroVideo() {
  return (
    <div className={styles.hero}>
      <video
        className={styles.video}
        src={"https://iyftybckcapbpnabaxfg.supabase.co/storage/v1/object/public/media/video_(1).mp4"}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  )
}
