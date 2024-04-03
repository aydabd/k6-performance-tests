# Tips and Tricks

## Install k3s

```bash
curl -sfL https://get.k3s.io | sh -
sudo k3s kubectl get node
/usr/local/bin/k3s-uninstall.sh
```

## Install k3d

```bash
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
```

## Remove all docker images

```bash
docker system prune

# Remove dangled images(no tags)
docker images -f dangling=true
docker image prune
```

## list images

```bash
docker images -a
```

## Remove one image

```bash
docker rmi Image Image
```

## Removing all images

### List all

```bash
docker images -a
```

### Remove all

```bash
docker rmi$(docker images -a -q)
```

## stop and remove all container

```bash
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)
```

## Fix the TlS certificate locally and use it in runtime with your docker

Download the certificate from a browser and export it locally into ex. /tmp folder

```bash
# copy the certificate into trusted store
sudo cp /tmp/_.mycert.crt /usr/local/share/ca-certificates/

# update the trusted store
sudo update-ca-certificates
```

## Check the certificate

### Check the cert is available

```bash
# check if the cert can be found from the list
awk -v cmd='openssl x509 -noout -subject' '/BEGIN/{close(cmd)};{print | cmd}' < /etc/ssl/certs/ca-certificates.crt | grep -i "DigiCert"

# output the content of certificate
openssl x509 -in /tmp/_.mycert.crt -text -noout
```

### Test the certificate if it can be validated

```bash
echo | openssl s_client -servername google.com -connect google.com:443
```

### How to Synchronize WSL2 date

This is an issue from windows which is not fixed yet(2024-03-19)

Workaround fix:

```sh
sudo hwclock -s
```
