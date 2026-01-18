# Building a Password Manager TUI (Part 2: Encryption)

Implementing military-grade AES-GCM encryption to securely store your credentials on disk.


## Encryption Strategy

We will use **AES-GCM** (Galois/Counter Mode). It provides both confidentiality (they can't read it) and integrity (they can't temper with it).

### The Store

```go
package store

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/json"
	"io"
	"os"
)

func Encrypt(data []byte, passphrase string) ([]byte, error) {
	// 1. Hash passphrase to 32 bytes (Key) - omitted for brevity, use Argon2 in prod
	key := []byte("an-example-32-byte-key-for-aes256!") 

	block, _ := aes.NewCipher(key)
	gcm, _ := cipher.NewGCM(block)

	nonce := make([]byte, gcm.NonceSize())
	io.ReadFull(rand.Reader, nonce)

	return gcm.Seal(nonce, nonce, data, nil), nil
}

func SavePasswords(file string, passwords []Password) error {
	data, _ := json.Marshal(passwords)
	encrypted, _ := Encrypt(data, "secret")
	return os.WriteFile(file, encrypted, 0644)
}
```

Now our `secrets.json` file renders as pure garbage bytes to anyone who tries to `cat` it.


## Conclusion

I hope this gives you a better understanding of Go. If you enjoyed this post, check out the other articles in this series!
