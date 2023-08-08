Config file used for firebase hosting (to utilize cavaliercontours.dev domain name). This was only
used once to redirect all traffic to the cloud run container service (not using firebase CDN).

Google cloud doc page on mapping the domain: https://cloud.google.com/run/docs/mapping-custom-domains#firebase

Updated using the firebase cli, `firebase deploy --only hosting --project PROJECT_ID` where `PROJECT_ID = cavaliercontours`.
